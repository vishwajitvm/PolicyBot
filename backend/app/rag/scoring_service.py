from app.schemas.query import QueryScores
from app.vectorstores.base_vector_store import VectorSearchResult


class ScoringService:
    def retrieval_score(self, candidates: list[VectorSearchResult]) -> float:
        if not candidates:
            return 0.0
        return round(min(1.0, sum(item.score for item in candidates) / len(candidates)), 3)

    def freshness_score(self, decision: dict) -> float:
        return 0.9 if decision.get("selected_chunk_ids") else 0.0

    def latency_score(self, latency_ms: int) -> float:
        return round(max(0.0, min(1.0, 1 - (latency_ms / 10000))), 3)

    def compose(
        self,
        candidates: list[VectorSearchResult],
        freshness_decision: dict,
        context_relevance_score: float,
        citation_quality_score: float,
    ) -> QueryScores:
        retrieval = self.retrieval_score(candidates)
        freshness = self.freshness_score(freshness_decision)
        confidence = round(
            retrieval * 0.35
            + freshness * 0.2
            + context_relevance_score * 0.25
            + citation_quality_score * 0.2,
            3,
        )
        return QueryScores(
            retrieval_score=retrieval,
            freshness_score=round(freshness, 3),
            context_relevance_score=round(context_relevance_score, 3),
            citation_quality_score=round(citation_quality_score, 3),
            answer_confidence=confidence,
        )
