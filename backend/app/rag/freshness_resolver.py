from datetime import datetime

from app.vectorstores.base_vector_store import VectorSearchResult


class FreshnessResolver:
    def resolve(self, candidates: list[VectorSearchResult]) -> tuple[list[VectorSearchResult], dict]:
        def freshness_key(result: VectorSearchResult) -> tuple[datetime, int, float]:
            payload = result.payload or {}
            date_value = payload.get("modified_at") or payload.get("created_at") or payload.get("ingested_at")
            if isinstance(date_value, str):
                try:
                    date = datetime.fromisoformat(date_value.replace("Z", "+00:00")).replace(tzinfo=None)
                except ValueError:
                    date = datetime.min
            elif isinstance(date_value, datetime):
                date = date_value.replace(tzinfo=None)
            else:
                date = datetime.min
            return date, int(payload.get("version") or 0), result.score

        selected = sorted(candidates, key=freshness_key, reverse=True)
        decision = {
            "strategy": "prefer_latest_valid_document",
            "candidate_count": len(candidates),
            "selected_chunk_ids": [item.chunk_id for item in selected[:5]],
            "explanation": "Candidates were ordered by modified_at, version, then retrieval score.",
        }
        return selected, decision
