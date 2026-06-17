from app.vectorstores.base_vector_store import VectorSearchResult


class Reranker:
    def rerank(self, candidates: list[VectorSearchResult], limit: int) -> list[VectorSearchResult]:
        return sorted(candidates, key=lambda item: item.score, reverse=True)[:limit]
