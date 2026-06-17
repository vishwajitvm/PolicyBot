from urllib.parse import urlencode

from fastapi import APIRouter
from fastapi.responses import RedirectResponse

from app.core.config import get_settings
from app.db.mongodb import mongodb
from app.schemas.common import ApiResponse
from app.schemas.google_drive import FolderSyncRequest, PickerSelection

router = APIRouter(prefix="/google-drive")


@router.get("/config", response_model=ApiResponse)
async def drive_config() -> ApiResponse:
    settings = get_settings()
    return ApiResponse(
        data={
            "client_id": settings.google_client_id,
            "api_key": settings.google_api_key,
            "scopes": settings.google_drive_scopes,
            "picker_enabled": bool(settings.google_client_id and settings.google_api_key),
        }
    )


@router.get("/oauth/start")
async def oauth_start():
    settings = get_settings()
    query = urlencode(
        {
            "client_id": settings.google_client_id,
            "redirect_uri": settings.google_redirect_uri,
            "response_type": "code",
            "scope": settings.google_drive_scopes,
            "access_type": "offline",
            "prompt": "consent",
        }
    )
    return RedirectResponse(f"https://accounts.google.com/o/oauth2/v2/auth?{query}")


@router.get("/oauth/callback", response_model=ApiResponse)
async def oauth_callback(code: str | None = None) -> ApiResponse:
    return ApiResponse(data={"code_received": bool(code)}, message="OAuth callback wired; token exchange storage is not implemented yet")


@router.post("/picker-selection", response_model=ApiResponse)
async def picker_selection(payload: PickerSelection) -> ApiResponse:
    sources = [
        {
            "source_id": item.get("id"),
            "name": item.get("name", "Drive item"),
            "source_type": "google_drive",
            "status": "selected",
            "metadata": item,
        }
        for item in payload.items
        if item.get("id")
    ]
    if sources:
        await mongodb.db()["sources"].insert_many(sources)
    return ApiResponse(data={"selected": len(payload.items)})


@router.post("/folder-sync", response_model=ApiResponse)
async def folder_sync(payload: FolderSyncRequest) -> ApiResponse:
    return ApiResponse(data=payload.model_dump(), message="Google Drive folder sync structure is wired; download/export worker is pending")


@router.get("/sources", response_model=ApiResponse)
async def drive_sources() -> ApiResponse:
    cursor = mongodb.db()["sources"].find({"source_type": "google_drive"}, {"_id": 0}).limit(100)
    return ApiResponse(data=[item async for item in cursor])
