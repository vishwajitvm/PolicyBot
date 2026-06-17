from datetime import datetime

from pydantic import BaseModel, Field


class QuerySession(BaseModel):
    session_id: str
    question: str
    answer: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    trace_id: str
    scores: dict = {}
