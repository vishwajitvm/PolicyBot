from datetime import datetime

from pydantic import BaseModel


class SourceCreateLocal(BaseModel):
    folder_path: str
    name: str | None = None


class SourceCreateDrive(BaseModel):
    drive_item_id: str
    name: str
    mime_type: str | None = None
    is_folder: bool = False


class SourceOut(BaseModel):
    source_id: str
    name: str
    source_type: str
    status: str = "connected"
    created_at: datetime
    metadata: dict = {}
