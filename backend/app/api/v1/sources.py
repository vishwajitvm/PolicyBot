from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter

from app.core.exceptions import NotFoundError
from app.db.mongodb import mongodb
from app.db.repositories.source_repository import SourceRepository
from app.models.source import Source
from app.schemas.common import ApiResponse
from app.schemas.source import SourceCreateDrive, SourceCreateLocal

router = APIRouter(prefix="/sources")


@router.get("", response_model=ApiResponse)
async def list_sources() -> ApiResponse:
    repo = SourceRepository(mongodb.db())
    return ApiResponse(data=await repo.list())


@router.post("/local-folder", response_model=ApiResponse)
async def create_local_source(payload: SourceCreateLocal) -> ApiResponse:
    source = Source(
        source_id=str(uuid4()),
        name=payload.name or payload.folder_path,
        source_type="local_folder",
        created_at=datetime.utcnow(),
        metadata={"folder_path": payload.folder_path},
    ).model_dump()
    await SourceRepository(mongodb.db()).insert_one(source)
    return ApiResponse(data=source, message="Local folder source created")


@router.post("/google-drive", response_model=ApiResponse)
async def create_drive_source(payload: SourceCreateDrive) -> ApiResponse:
    source = Source(
        source_id=str(uuid4()),
        name=payload.name,
        source_type="google_drive",
        created_at=datetime.utcnow(),
        metadata=payload.model_dump(),
    ).model_dump()
    await SourceRepository(mongodb.db()).insert_one(source)
    return ApiResponse(data=source, message="Google Drive source created")


@router.delete("/{source_id}", response_model=ApiResponse)
async def delete_source(source_id: str) -> ApiResponse:
    deleted = await SourceRepository(mongodb.db()).delete_one({"source_id": source_id})
    if not deleted:
        raise NotFoundError(f"Source not found: {source_id}")
    return ApiResponse(data={"source_id": source_id}, message="Source deleted")
