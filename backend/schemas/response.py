from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str
    service: str
    time: str


class Indicator(BaseModel):
    severity: Literal["low", "medium", "high"]
    title: str
    detail: str


class Recommendation(BaseModel):
    priority: Literal["low", "medium", "high"]
    title: str
    detail: str


class ThreatBreakdown(BaseModel):
    malicious: int = Field(ge=0)
    suspicious: int = Field(ge=0)
    harmless: int = Field(ge=0)


class EngineResult(BaseModel):
    engine: str
    result: str


class VirusTotalDetails(BaseModel):
    available: bool
    source: Literal["hash_lookup", "uploaded", "unavailable"]
    malicious: int = Field(ge=0)
    suspicious: int = Field(ge=0)
    harmless: int = Field(ge=0)
    undetected: int = Field(ge=0)
    timeout: int = Field(ge=0)
    engine_results: list[EngineResult] = Field(default_factory=list)
    failure_reason: Optional[str] = None
    permalink: Optional[str] = None


class AnalysisResponse(BaseModel):
    filename: str
    size_bytes: int = Field(ge=0)
    size_human: str
    file_extension: str
    mime_type: str
    file_type_description: str
    sha256: str
    scanned_at: str

    verdict: Literal["clean", "suspicious", "malicious"]
    score: int = Field(ge=0, le=100)
    summary: str
    threat_breakdown: ThreatBreakdown
    engine_results: list[EngineResult]
    recommendations: list[str]

    indicators: list[Indicator]
    recommendation_details: list[Recommendation]
    virustotal: VirusTotalDetails
