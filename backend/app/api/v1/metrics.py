from fastapi import APIRouter
from app.observability.metrics_service import metrics_service
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/metrics", tags=["metrics"])

@router.get("/", response_model=ApiResponse)
async def get_metrics(days_filter: int = None, model_filter: str = None) -> ApiResponse:
    data = await metrics_service.get_summary(days_filter, model_filter)
    return ApiResponse(data=data, message="Metrics retrieved successfully")
