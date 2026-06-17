from datetime import datetime

from pydantic import BaseModel, Field


class Trace(BaseModel):
    trace_id: str
    session_id: str | None = None
    question: str | None = None
    events: list[dict] = []
    retrieved_chunks: list[dict] = []
    freshness_decision: dict = {}
    scores: dict = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)
