from app.core.time import get_current_time
from datetime import datetime

from pydantic import BaseModel, Field


class QuerySession(BaseModel):
    session_id: str
    question: str
    answer: str
    created_at: datetime = Field(default_factory=get_current_time)
    trace_id: str
    scores: dict = {}
