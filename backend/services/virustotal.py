from __future__ import annotations

import os
from typing import Any, Dict
import base64

import requests

from schemas.response import EngineResult, VirusTotalDetails

VT_API_BASE = "https://www.virustotal.com/api/v3"
DEFAULT_TIMEOUT = 20


def _key() -> str:
    return os.getenv("VIRUSTOTAL_API_KEY", "").strip()


def _headers() -> Dict[str, str]:
    return {"x-apikey": _key()}


def _empty(reason: str = "VirusTotal unavailable.") -> VirusTotalDetails:
    return VirusTotalDetails(
        available=False,
        source="unavailable",
        malicious=0,
        suspicious=0,
        harmless=0,
        undetected=0,
        timeout=0,
        engine_results=[],
        failure_reason=reason,
        permalink=None,
    )


def _extract_engine_results(attrs: Dict[str, Any]) -> list[EngineResult]:
    last_results = attrs.get("last_analysis_results", {}) or {}
    parsed: list[EngineResult] = []

    for engine_name, result_obj in last_results.items():
        result = result_obj.get("result") or result_obj.get("category") or "undetected"
        parsed.append(EngineResult(engine=engine_name, result=str(result)))

    return parsed


def _parse_stats(data: Dict[str, Any], source: str) -> VirusTotalDetails:
    attrs = data.get("data", {}).get("attributes", {})
    stats = attrs.get("last_analysis_stats", {}) or {}

    data_id = data.get("data", {}).get("id", "")

    # 🔥 FIX: detect type
    if source == "url_lookup":
        permalink = f"https://www.virustotal.com/gui/url/{data_id}"
    else:
        permalink = f"https://www.virustotal.com/gui/file/{data_id}"

    return VirusTotalDetails(
        available=True,
        source=source,
        malicious=int(stats.get("malicious", 0)),
        suspicious=int(stats.get("suspicious", 0)),
        harmless=int(stats.get("harmless", 0)),
        undetected=int(stats.get("undetected", 0)),
        timeout=int(stats.get("timeout", 0)),
        engine_results=_extract_engine_results(attrs),
        failure_reason=None,
        permalink=permalink,
    )

def _lookup_by_hash(file_hash: str) -> VirusTotalDetails:
    resp = requests.get(
        f"{VT_API_BASE}/files/{file_hash}",
        headers=_headers(),
        timeout=DEFAULT_TIMEOUT,
    )

    if resp.status_code == 200:
        return _parse_stats(resp.json(), source="hash_lookup")
    if resp.status_code == 404:
        return _empty("Hash not present in VirusTotal database.")
    return _empty(f"VirusTotal hash lookup failed ({resp.status_code}).")


def _upload_file(file_bytes: bytes, filename: str) -> VirusTotalDetails:
    files = {"file": (filename, file_bytes)}
    resp = requests.post(
        f"{VT_API_BASE}/files",
        headers=_headers(),
        files=files,
        timeout=DEFAULT_TIMEOUT,
    )

    if resp.status_code not in (200, 201):
        return _empty(f"VirusTotal upload failed ({resp.status_code}).")

    # Upload response might not immediately contain analysis stats.
    # We return as available=True with source=uploaded but 0 stats initially.
    result = resp.json()
    analysis_id = result.get("data", {}).get("id")
    permalink = (
        f"https://www.virustotal.com/gui/file-analysis/{analysis_id}"
        if analysis_id
        else None
    )

    return VirusTotalDetails(
        available=True,
        source="uploaded",
        malicious=0,
        suspicious=0,
        harmless=0,
        undetected=0,
        timeout=0,
        engine_results=[],
        failure_reason="File uploaded to VirusTotal; analysis may still be in progress.",
        permalink=permalink,
    )


def fetch_or_submit_to_virustotal(
    file_hash: str,
    file_bytes: bytes,
    filename: str,
) -> VirusTotalDetails:
    api_key = _key()
    if not api_key:
        return _empty("VIRUSTOTAL_API_KEY is missing.")

    try:
        lookup = _lookup_by_hash(file_hash)
        if lookup.available:
            return lookup

        # If hash is unknown, submit file (VirusTotal may take time to complete).
        if "not present" in (lookup.failure_reason or "").lower():
            # Free endpoint supports up to ~32MB direct upload.
            if len(file_bytes) <= 32 * 1024 * 1024:
                return _upload_file(file_bytes=file_bytes, filename=filename)
            return _empty(
                "File hash unknown and file is larger than 32 MB, so direct VT upload was skipped."
            )

        return lookup
    except requests.RequestException as exc:
        return _empty(f"VirusTotal request error: {exc}")

def _lookup_url(url: str) -> VirusTotalDetails:
    import base64

    url_id = base64.urlsafe_b64encode(url.encode()).decode().strip("=")

    resp = requests.get(
        f"{VT_API_BASE}/urls/{url_id}",
        headers=_headers(),
        timeout=DEFAULT_TIMEOUT,
    )

    if resp.status_code == 200:
        # 🔥 reuse existing structure
        return _parse_stats(resp.json(), source="hash_lookup")

    if resp.status_code == 404:
        return _empty("URL not present in VirusTotal database.")

    return _empty(f"VirusTotal URL lookup failed ({resp.status_code}).")

def _submit_url(url: str) -> VirusTotalDetails:
    resp = requests.post(
        f"{VT_API_BASE}/urls",
        headers=_headers(),
        data={"url": url},
        timeout=DEFAULT_TIMEOUT,
    )

    if resp.status_code not in (200, 201):
        return _empty(f"VirusTotal URL submission failed ({resp.status_code}).")

    result = resp.json()
    analysis_id = result.get("data", {}).get("id")

    permalink = (
        f"https://www.virustotal.com/gui/url/{analysis_id}"
        if analysis_id
        else None
    )

    return VirusTotalDetails(
        available=True,
        source="uploaded",  # 🔥 important fix
        malicious=0,
        suspicious=0,
        harmless=0,
        undetected=0,
        timeout=0,
        engine_results=[],
        failure_reason="URL submitted; analysis pending.",
        permalink=permalink,
    )

def fetch_url_from_virustotal(url: str) -> VirusTotalDetails:
    api_key = _key()
    if not api_key:
        return _empty("VIRUSTOTAL_API_KEY is missing.")

    try:
        lookup = _lookup_url(url)

        if lookup.available:
            return lookup

        if "not present" in (lookup.failure_reason or "").lower():
            return _submit_url(url)

        return lookup

    except requests.RequestException as exc:
        return _empty(f"VirusTotal URL request error: {exc}")
    