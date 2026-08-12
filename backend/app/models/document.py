from app.core.time import get_current_time
from datetime import datetime

from pydantic import BaseModel, Field


class Document(BaseModel):
    document_id: str
    source_id: str
    file_name: str
    file_path: str
    source_type: str
    content_hash: str
    version: int = 1
    created_at: datetime = Field(default_factory=get_current_time)
    modified_at: datetime | None = None
    ingested_at: datetime = Field(default_factory=get_current_time)
    metadata: dict = {}
