from tracenest import logger
from fastapi import APIRouter, Request

from app.core.config import get_settings
from app.db.mongodb import mongodb
from app.schemas.common import ApiResponse
from app.schemas.health import DependencyHealth, HealthResponse


router = APIRouter()


@router.get("/health", response_model=ApiResponse)
async def health(request: Request) -> ApiResponse:
    try:
        settings = get_settings()
        mongo_status, mongo_detail = await mongodb.health()
        vector_store = getattr(request.app.state, "vector_store", None)
        if vector_store:
            vector_status, vector_detail = await vector_store.health()
        else:
            vector_status, vector_detail = "unavailable", "not initialized"
        overall = "ok" if mongo_status == "ok" and vector_status == "ok" else "degraded"
        return ApiResponse(
            data=HealthResponse(
                app=settings.app_name,
                environment=settings.app_env,
                status=overall,
                mongodb=DependencyHealth(status=mongo_status, detail=mongo_detail),
                vector_store=DependencyHealth(status=vector_status, detail=vector_detail),
            ).model_dump(),
            message="Health check completed",
        )
    except Exception as exc:
        logger.exception("Failed to perform health check")
        return ApiResponse(success=False, message=str(exc))
