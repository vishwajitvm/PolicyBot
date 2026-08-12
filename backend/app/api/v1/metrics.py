from fastapi import APIRouter
from app.observability.metrics_service import metrics_service
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/metrics", tags=["metrics"])

@router.get("/", response_model=ApiResponse)
async def get_metrics() -> ApiResponse:
    data = await metrics_service.get_summary()
    return ApiResponse(data=data, message="Metrics retrieved successfully")
