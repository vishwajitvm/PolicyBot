from tracenest import logger
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
    try:
        settings = get_settings()
        return ApiResponse(
            data={
                "client_id": settings.google_client_id,
                "api_key": settings.google_api_key,
                "scopes": settings.google_drive_scopes,
                "picker_enabled": bool(settings.google_client_id and settings.google_api_key),
            },
            message="Drive config retrieved"
        )
    except Exception as exc:
        logger.error("Failed to get drive config")
        return ApiResponse(success=False, message=str(exc))


@router.get("/oauth/start")
async def oauth_start():
    try:
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
    except Exception as exc:
        logger.error("Failed to start OAuth")
        # We still need to return a RedirectResponse, but in case of error, we redirect to an error page?
        # For simplicity, we'll redirect to the frontend with an error? But we don't know the frontend URL.
        # Let's redirect to the root with a query parameter indicating error.
        # However, we cannot change the behavior too much. We'll log and then raise the exception?
        # But this is a GET endpoint that doesn't return ApiResponse. We'll let it propagate and be caught by the global exception handler?
        # Since we are not returning ApiResponse, we cannot change the return type easily.
        # We'll leave it as is for now, but note that if there is an error in building the redirect URL, it will cause a 500.
        # Given that the settings are loaded from get_settings() which is cached, it is unlikely to throw.
        # We'll re-raise the exception.
        raise


@router.get("/oauth/callback", response_model=ApiResponse)
async def oauth_callback(code: str | None = None) -> ApiResponse:
    try:
        return ApiResponse(data={"code_received": bool(code)}, message="OAuth callback wired; token exchange storage is not implemented yet")
    except Exception as exc:
        logger.error("Failed to process OAuth callback")
        return ApiResponse(success=False, message=str(exc))


@router.post("/picker-selection", response_model=ApiResponse)
async def picker_selection(payload: PickerSelection) -> ApiResponse:
    try:
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
        return ApiResponse(data={"selected": len(payload.items)}, message="Sources selected")
    except Exception as exc:
        logger.error("Failed to process picker selection")
        return ApiResponse(success=False, message=str(exc))


@router.post("/folder-sync", response_model=ApiResponse)
async def folder_sync(payload: FolderSyncRequest) -> ApiResponse:
    try:
        return ApiResponse(data=payload.model_dump(), message="Google Drive folder sync structure is wired; download/export worker is pending")
    except Exception as exc:
        logger.error("Failed to process folder sync")
        return ApiResponse(success=False, message=str(exc))


@router.get("/sources", response_model=ApiResponse)
async def drive_sources() -> ApiResponse:
    try:
        cursor = mongodb.db()["sources"].find({"source_type": "google_drive"}, {"_id": 0}).limit(100)
        return ApiResponse(data=[item async for item in cursor], message="Drive sources retrieved")
    except Exception as exc:
        logger.error("Failed to list drive sources")
        return ApiResponse(success=False, message=str(exc))
