from app.core.time import get_current_time
from datetime import datetime, UTC
from typing import List, Dict, Any
from app.db.mongodb import mongodb

class MetricsService:
    async def log_usage(self, provider: str, model: str, input_tokens: int, output_tokens: int, latency_ms: int, success: bool, endpoint_type: str = "chat"):
        """Log an LLM or Embedding request to the database."""
        doc = {
            "timestamp": get_current_time(),
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

    async def get_summary(self, days_filter: int = None, model_filter: str = None) -> Dict[str, Any]:
        """Get aggregated metrics for the dashboard."""
        
        match_stage = {}
        if days_filter is not None:
            from datetime import timedelta
            start_date = get_current_time() - timedelta(days=days_filter)
            match_stage["timestamp"] = {"$gte": start_date}
            
        if model_filter:
            # model_filter can be 'provider / model' format from unique_models_list
            if " / " in model_filter:
                prov, mod = model_filter.split(" / ", 1)
                match_stage["provider"] = prov
                match_stage["model"] = mod
            else:
                match_stage["model"] = model_filter

        pipeline = []
        if match_stage:
            pipeline.append({"$match": match_stage})
            
        pipeline.append({
            "$group": {
                "_id": {"provider": "$provider", "model": "$model", "endpoint": "$endpoint_type"},
                "total_requests": {"$sum": 1},
                "successful_requests": {"$sum": {"$cond": [{"$eq": ["$success", True]}, 1, 0]}},
                "failed_requests": {"$sum": {"$cond": [{"$eq": ["$success", False]}, 1, 0]}},
                "total_input_tokens": {"$sum": "$input_tokens"},
                "total_output_tokens": {"$sum": "$output_tokens"},
                "avg_latency_ms": {"$avg": "$latency_ms"}
            }
        })
        
        results = await mongodb.db()["llm_metrics"].aggregate(pipeline).to_list(length=1000)
        
        summary = []
        for r in results:
            total = r["total_requests"]
            summary.append({
                "provider": r["_id"]["provider"],
                "model": r["_id"]["model"],
                "endpoint_type": r["_id"]["endpoint"],
                "total_requests": total,
                "successful_requests": r["successful_requests"],
                "failed_requests": r["failed_requests"],
                "error_rate": r["failed_requests"] / total if total > 0 else 0,
                "success_rate": r["successful_requests"] / total if total > 0 else 0,
                "total_tokens": r["total_input_tokens"] + r["total_output_tokens"],
                "avg_latency_ms": int(r["avg_latency_ms"])
            })

        timeseries_pipeline = []
        if match_stage:
            timeseries_pipeline.append({"$match": match_stage})
            
        timeseries_pipeline.extend([
            {
                "$group": {
                    "_id": {
                        "date": {"$dateToString": {"format": "%Y-%m-%d", "date": "$timestamp"}},
                    },
                    "total_requests": {"$sum": 1},
                    "total_tokens": {"$sum": "$total_tokens"},
                    "successful_requests": {"$sum": {"$cond": [{"$eq": ["$success", True]}, 1, 0]}},
                    "failed_requests": {"$sum": {"$cond": [{"$eq": ["$success", False]}, 1, 0]}}
                }
            },
            {"$sort": {"_id.date": 1}}
        ])
        
        ts_results = await mongodb.db()["llm_metrics"].aggregate(timeseries_pipeline).to_list(length=100)
        timeseries = []
        for r in ts_results:
            if r["_id"].get("date"):
                total_ts = r["total_requests"]
                timeseries.append({
                    "date": r["_id"]["date"],
                    "total_requests": total_ts,
                    "total_tokens": r["total_tokens"],
                    "success_rate": r["successful_requests"] / total_ts if total_ts > 0 else 0,
                    "error_rate": r["failed_requests"] / total_ts if total_ts > 0 else 0
                })
            
        return {"metrics": summary, "timeseries": timeseries}

metrics_service = MetricsService()
