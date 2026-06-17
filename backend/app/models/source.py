from datetime import datetime

from pydantic import BaseModel, Field


class Source(BaseModel):
    source_id: str
    name: str
    source_type: str
    status: str = "connected"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    metadata: dict = {}
