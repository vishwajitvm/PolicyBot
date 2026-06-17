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
    created_at: datetime = Field(default_factory=datetime.utcnow)
    modified_at: datetime | None = None
    ingested_at: datetime = Field(default_factory=datetime.utcnow)
    metadata: dict = {}
