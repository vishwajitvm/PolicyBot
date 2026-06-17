from datetime import datetime

from pydantic import BaseModel


class TraceEvent(BaseModel):
    step: str
    status: str
    input_summary: dict = {}
    output_summary: dict = {}
    latency_ms: int = 0
    timestamp: datetime


class TraceOut(BaseModel):
    trace_id: str
    session_id: str | None = None
    question: str | None = None
    events: list[TraceEvent]
    retrieved_chunks: list[dict] = []
    freshness_decision: dict = {}
    scores: dict = {}
