from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Tuple

from schemas.response import (
    AnalysisResponse,
    EngineResult,
    Indicator,
    Recommendation,
    ThreatBreakdown,
    VirusTotalDetails,
)
from services.virustotal import fetch_or_submit_to_virustotal
from utils.filetype import detect_file_type
from utils.hashing import sha256_bytes


HIGH_RISK_EXTENSIONS = {
    ".exe",
    ".dll",
    ".bat",
    ".cmd",
    ".ps1",
    ".vbs",
    ".js",
    ".jse",
    ".jar",
    ".scr",
    ".msi",
    ".apk",
}

SCRIPT_LIKE_MIME_PREFIXES = (
    "application/x-dosexec",
    "application/x-msdownload",
    "application/x-sh",
    "text/x-python",
    "text/x-shellscript",
    "application/javascript",
    "text/javascript",
)


def _ext(filename: str) -> str:
    idx = filename.rfind(".")
    return filename[idx:].lower() if idx != -1 else ""


def _human_size(num_bytes: int) -> str:
    units = ["B", "KB", "MB", "GB", "TB"]
    value = float(num_bytes)
    unit_idx = 0
    while value >= 1024 and unit_idx < len(units) - 1:
        value /= 1024
        unit_idx += 1
    return f"{value:.2f} {units[unit_idx]}"


def _base_heuristic_score(extension: str, mime_type: str, size_bytes: int) -> Tuple[int, List[Indicator]]:
    score = 0
    indicators: List[Indicator] = []

    if extension in HIGH_RISK_EXTENSIONS:
        score += 20
        indicators.append(
            Indicator(
                severity="medium",
                title="Potentially dangerous extension",
                detail=f"Extension `{extension}` is frequently used by executable/script payloads.",
            )
        )

    if mime_type.startswith(SCRIPT_LIKE_MIME_PREFIXES):
        score += 15
        indicators.append(
            Indicator(
                severity="medium",
                title="Executable or script-like MIME type",
                detail=f"Detected MIME type `{mime_type}` can execute code.",
            )
        )

    if size_bytes == 0:
        indicators.append(
            Indicator(
                severity="low",
                title="Empty file",
                detail="The uploaded file is empty and cannot be meaningfully analyzed.",
            )
        )

    if size_bytes > 25 * 1024 * 1024:
        indicators.append(
            Indicator(
                severity="low",
                title="Large file size",
                detail="Large files may require longer scanning time or reduced engine coverage.",
            )
        )

    return score, indicators


def _vt_to_score(vt: VirusTotalDetails) -> Tuple[int, List[Indicator]]:
    if not vt.available:
        return 0, []

    malicious = vt.malicious
    suspicious = vt.suspicious
    harmless = vt.harmless
    undetected = vt.undetected
    total = max(malicious + suspicious + harmless + undetected, 1)

    ratio = (malicious * 1.0 + suspicious * 0.5) / total
    score = int(min(95, ratio * 100))

    indicators: List[Indicator] = []

    if malicious > 0:
        indicators.append(
            Indicator(
                severity="high",
                title="VirusTotal malicious detections",
                detail=f"{malicious} engine(s) flagged this file as malicious.",
            )
        )
    if suspicious > 0:
        indicators.append(
            Indicator(
                severity="medium",
                title="VirusTotal suspicious detections",
                detail=f"{suspicious} engine(s) flagged this file as suspicious.",
            )
        )

    return score, indicators


def _verdict(score: int) -> str:
    if score >= 70:
        return "malicious"
    if score >= 35:
        return "suspicious"
    return "clean"


def _recommendation_details(verdict: str) -> List[Recommendation]:
    common = [
        Recommendation(
            priority="medium",
            title="Store artifact hash in your IOC list",
            detail="Track the SHA256 in your internal dataset to identify repeated submissions.",
        ),
        Recommendation(
            priority="medium",
            title="Correlate with endpoint and network telemetry",
            detail="Match this file event with process tree, DNS, and outbound connection logs.",
        ),
    ]

    if verdict == "malicious":
        return [
            Recommendation(
                priority="high",
                title="Isolate the affected host immediately",
                detail="Contain potential lateral movement and stop process execution.",
            ),
            Recommendation(
                priority="high",
                title="Block related indicators",
                detail="Block associated domains/IPs/hash indicators across endpoint and gateway controls.",
            ),
            *common,
        ]
    if verdict == "suspicious":
        return [
            Recommendation(
                priority="high",
                title="Perform manual triage",
                detail="Run sandbox detonation or deeper static analysis before allowing execution.",
            ),
            *common,
        ]
    return [
        Recommendation(
            priority="low",
            title="Keep monitoring",
            detail="No strong malicious evidence currently; retain telemetry for future correlation.",
        ),
        *common,
    ]


def _recommendation_strings(details: List[Recommendation]) -> List[str]:
    return [f"{item.title}: {item.detail}" for item in details]


def analyze_file(filename: str, content: bytes) -> AnalysisResponse:
    size_bytes = len(content)
    sha256 = sha256_bytes(content)
    detected = detect_file_type(content=content, filename=filename)
    extension = _ext(filename)

    heuristic_score, heuristic_indicators = _base_heuristic_score(
        extension=extension,
        mime_type=detected.mime_type,
        size_bytes=size_bytes,
    )

    vt = fetch_or_submit_to_virustotal(
        file_hash=sha256,
        file_bytes=content,
        filename=filename,
    )
    vt_score, vt_indicators = _vt_to_score(vt)

    # Weight VT more strongly when available while preserving local heuristics.
    score = vt_score if vt.available else heuristic_score
    if vt.available:
        score = int(min(100, score + (heuristic_score * 0.35)))

    final_verdict = _verdict(score)
    summary = (
        "High-confidence malicious indicators detected."
        if final_verdict == "malicious"
        else "Potentially suspicious characteristics found. Manual review recommended."
        if final_verdict == "suspicious"
        else "No strong malicious indicators detected from current signals."
    )
    recommendation_details = _recommendation_details(final_verdict)

    return AnalysisResponse(
        filename=filename,
        size_bytes=size_bytes,
        size_human=_human_size(size_bytes),
        file_extension=extension or "none",
        mime_type=detected.mime_type,
        file_type_description=detected.description,
        sha256=sha256,
        scanned_at=datetime.now(timezone.utc).isoformat(),
        verdict=final_verdict,
        score=score,
        summary=summary,
        threat_breakdown=ThreatBreakdown(
            malicious=vt.malicious,
            suspicious=vt.suspicious,
            harmless=vt.harmless,
        ),
        engine_results=[EngineResult(engine=i.engine, result=i.result) for i in vt.engine_results],
        recommendations=_recommendation_strings(recommendation_details),
        indicators=[*vt_indicators, *heuristic_indicators],
        recommendation_details=recommendation_details,
        virustotal=vt,
    )
