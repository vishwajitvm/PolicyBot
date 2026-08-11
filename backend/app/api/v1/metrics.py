from fastapi import APIRouter
from app.observability.metrics_service import metrics_service

router = APIRouter(prefix="/metrics", tags=["metrics"])

@router.get("/")
async def get_metrics():
    return await metrics_service.get_summary()
