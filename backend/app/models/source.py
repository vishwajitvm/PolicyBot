from app.core.time import get_current_time
from datetime import datetime

from pydantic import BaseModel, Field


class Source(BaseModel):
    source_id: str
    name: str
    source_type: str
    status: str = "connected"
    created_at: datetime = Field(default_factory=get_current_time)
    metadata: dict = {}
