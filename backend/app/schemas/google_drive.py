from pydantic import BaseModel


class DriveConfigOut(BaseModel):
    client_id: str
    api_key: str
    scopes: str
    picker_enabled: bool


class PickerSelection(BaseModel):
    items: list[dict]


class FolderSyncRequest(BaseModel):
    folder_id: str
    source_id: str | None = None
