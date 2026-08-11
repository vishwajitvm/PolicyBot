from datetime import datetime, UTC
from typing import List, Dict, Any
from app.db.mongodb import mongodb

class MetricsService:
    async def log_usage(self, provider: str, model: str, input_tokens: int, output_tokens: int, latency_ms: int, success: bool, endpoint_type: str = "chat"):
        """Log an LLM or Embedding request to the database."""
        doc = {
            "timestamp": datetime.now(UTC),
            "provider": provider,
            "model": model,
            "input_tokens": input_tokens or 0,
            "output_tokens": output_tokens or 0,
            "total_tokens": (input_tokens or 0) + (output_tokens or 0),
            "latency_ms": latency_ms,
            "success": success,
            "endpoint_type": endpoint_type
        }
        try:
            await mongodb.db()["llm_metrics"].insert_one(doc)
        except Exception as e:
            from tracenest import logger
            logger.error(f"Failed to log LLM metrics: {e}")

    async def get_summary(self) -> Dict[str, Any]:
        """Get aggregated metrics for the dashboard."""
        pipeline = [
            {
                "$group": {
                    "_id": {"provider": "$provider", "model": "$model", "endpoint": "$endpoint_type"},
                    "total_requests": {"$sum": 1},
                    "successful_requests": {"$sum": {"$cond": [{"$eq": ["$success", True]}, 1, 0]}},
                    "failed_requests": {"$sum": {"$cond": [{"$eq": ["$success", False]}, 1, 0]}},
                    "total_input_tokens": {"$sum": "$input_tokens"},
                    "total_output_tokens": {"$sum": "$output_tokens"},
                    "avg_latency_ms": {"$avg": "$latency_ms"}
                }
            }
        ]
        
        results = await mongodb.db()["llm_metrics"].aggregate(pipeline).to_list(length=1000)
        
        summary = []
        for r in results:
            summary.append({
                "provider": r["_id"]["provider"],
                "model": r["_id"]["model"],
                "endpoint_type": r["_id"]["endpoint"],
                "total_requests": r["total_requests"],
                "successful_requests": r["successful_requests"],
                "failed_requests": r["failed_requests"],
                "error_rate": r["failed_requests"] / r["total_requests"] if r["total_requests"] > 0 else 0,
                "total_tokens": r["total_input_tokens"] + r["total_output_tokens"],
                "avg_latency_ms": int(r["avg_latency_ms"])
            })
            
        return {"metrics": summary}

metrics_service = MetricsService()
