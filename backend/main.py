from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi import Body
from services.virustotal import fetch_url_from_virustotal
from fastapi.middleware.cors import CORSMiddleware

from schemas.response import AnalysisResponse, HealthResponse
from services.analyzer import analyze_file

load_dotenv()

app = FastAPI(
    title="CyberScan Backend",
    version="1.0.0",
    description="FastAPI backend for malware-oriented file analysis with VirusTotal enrichment.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://cyber-scan-coral.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service="cyberscan-backend",
        time=datetime.now(timezone.utc).isoformat(),
    )


@app.post("/scan", response_model=AnalysisResponse)
async def scan_file(file: UploadFile = File(...)) -> AnalysisResponse:
    try:
        content = await file.read()
    except Exception as exc:  # pragma: no cover - defensive runtime boundary
        raise HTTPException(status_code=400, detail=f"Unable to read uploaded file: {exc}") from exc

    if content is None:
        raise HTTPException(status_code=400, detail="No file content received.")

    # Accept any file type. Keep an upper bound to avoid memory abuse.
    max_size_bytes = 100 * 1024 * 1024
    if len(content) > max_size_bytes:
        raise HTTPException(
            status_code=413,
            detail="File is too large. Max supported size is 100 MB.",
        )

    filename = file.filename or "uploaded_file"
    report: AnalysisResponse = analyze_file(filename=filename, content=content)
    return report

@app.post("/scan-url", response_model=AnalysisResponse)
async def scan_url(payload: dict = Body(...)) -> AnalysisResponse:
    url = payload.get("url")

    if not url:
        raise HTTPException(status_code=400, detail="URL is required")

    try:
        vt = fetch_url_from_virustotal(url)

        # 🔥 Convert VT → your AnalysisResponse format
        score = min(100, vt.malicious * 20 + vt.suspicious * 10)

        verdict = (
            "malicious" if vt.malicious > 0
            else "suspicious" if vt.suspicious > 0
            else "clean"
        )

        return AnalysisResponse(
    verdict=verdict,
    score=score,
    summary="URL analyzed using threat intelligence sources.",

    threat_breakdown={
        "malicious": vt.malicious,
        "suspicious": vt.suspicious,
        "harmless": vt.harmless,
    },

    engine_results=vt.engine_results,

    recommendations=[
        "Avoid visiting if flagged",
        "Verify domain authenticity",
    ],

    # 🔥 REQUIRED FIELDS (FILL DEFAULTS)
    filename=url,
    size_bytes=0,
    size_human="N/A",
    file_extension="url",
    mime_type="text/url",
    file_type_description="URL",
    sha256="N/A",

    scanned_at=datetime.now(timezone.utc).isoformat(),

    indicators=[],  # important
    recommendation_details=[],  # important

    virustotal=vt,
)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"URL scan failed: {exc}") from exc
    
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

