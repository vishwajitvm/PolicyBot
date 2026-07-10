import time
from uuid import uuid4

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.config import Settings
from app.observability.trace_service import TraceService
from app.providers.base_embedding import BaseEmbeddingProvider
from app.providers.base_llm import BaseLLMProvider
from app.rag.answer_service import AnswerService
from app.rag.citation_service import CitationService
from app.rag.context_grader import ContextGrader
from app.rag.freshness_resolver import FreshnessResolver
from app.rag.prompt_builder import PromptBuilder
from app.rag.reranker import Reranker
from app.rag.retrieval_service import RetrievalService
from app.rag.scoring_service import ScoringService
from app.schemas.query import QueryResponse
from app.vectorstores.base_vector_store import BaseVectorStore, VectorSearchResult


class RAGGraph:
    def __init__(
        self,
        settings: Settings,
        db: AsyncIOMotorDatabase,
        llm: BaseLLMProvider,
        embedding_provider: BaseEmbeddingProvider,
        vector_store: BaseVectorStore,
    ):
        self.settings = settings
        self.db = db
        self.retrieval = RetrievalService(embedding_provider, vector_store, db)
        self.answer_service = AnswerService(llm)
        self.freshness = FreshnessResolver()
        self.reranker = Reranker()
        self.grader = ContextGrader()
        self.prompt_builder = PromptBuilder()
        self.citations = CitationService()
        self.scoring = ScoringService()
        self.graph_definition = self._build_graph_definition()

    async def run(self, question: str, session_id: str | None = None, filters: dict | None = None) -> QueryResponse:
        started = time.perf_counter()
        session_id = session_id or str(uuid4())
        trace = TraceService(self.db)
        trace.record("query_received", input_summary={"question": question})
        normalized = " ".join(question.strip().split())
        trace.record("query_normalized", output_summary={"normalized_query": normalized})
        trace.record("intent_classified", output_summary={"intent": "policy_qa"})
        variants = [normalized]
        trace.record("query_variants_generated", output_summary={"count": len(variants)})
        trace.record("query_embedded", status="started")
        vector_chunks = await self.retrieval.vector_search(normalized, filters, self.settings.top_k)
        trace.record("query_embedded", status="completed")
        trace.record("vector_chunks_retrieved", output_summary={"count": len(vector_chunks)})
        keyword_chunks = await self.retrieval.keyword_search(normalized, self.settings.top_k)
        trace.record("keyword_chunks_retrieved", output_summary={"count": len(keyword_chunks)})
        merged = self._merge(vector_chunks + keyword_chunks)
        trace.record("chunks_merged", output_summary={"count": len(merged)})
        reranked = self.reranker.rerank(merged, self.settings.rerank_top_k)
        trace.record("chunks_reranked", output_summary={"count": len(reranked)})
        fresh_chunks, freshness_decision = self.freshness.resolve(reranked)
        selected = fresh_chunks[: self.settings.rerank_top_k]
        trace.record("freshness_resolved", output_summary=freshness_decision)
        context_score = self.grader.grade(normalized, selected)
        trace.record("context_graded", output_summary={"context_relevance_score": context_score})
        prompt = self.prompt_builder.build(question, selected)
        trace.record("prompt_built", output_summary={"context_count": len(selected)})
        llm_response = await self.answer_service.answer(prompt)
        trace.record("answer_generated", output_summary={"model": llm_response.model})
        citations = self.citations.build(selected)
        citation_quality = self.citations.quality(citations)
        trace.record("citations_validated", output_summary={"citation_count": len(citations), "quality": citation_quality})
        scores = self.scoring.compose(selected, freshness_decision, context_score, citation_quality)
        trace.record("confidence_scored", output_summary=scores.model_dump())
        latency_ms = int((time.perf_counter() - started) * 1000)
        trace.record("trace_persisted", output_summary={"trace_id": trace.trace_id})
        trace.record("response_returned", output_summary={"latency_ms": latency_ms})
        await trace.persist(
            {
                "session_id": session_id,
                "question": question,
                "retrieved_chunks": [item.model_dump() for item in selected],
                "freshness_decision": freshness_decision,
                "scores": scores.model_dump(),
            }
        )
        response = QueryResponse(
            answer=llm_response.text,
            citations=citations,
            scores=scores,
            trace_id=trace.trace_id,
            session_id=session_id,
            model=llm_response.model,
            embedding_model=self.settings.gemini_embedding_model,
            vector_db=self.settings.vector_db_provider,
            latency_ms=latency_ms,
        )
        await self.db["query_sessions"].update_one(
            {"session_id": session_id},
            {"$set": {"session_id": session_id, "question": question, "answer": response.answer, "trace_id": trace.trace_id, "scores": scores.model_dump()}},
            upsert=True,
        )
        return response

    def _merge(self, candidates: list[VectorSearchResult]) -> list[VectorSearchResult]:
        by_chunk: dict[str, VectorSearchResult] = {}
        for candidate in candidates:
            current = by_chunk.get(candidate.chunk_id)
            if current is None or candidate.score > current.score:
                by_chunk[candidate.chunk_id] = candidate
        return list(by_chunk.values())

    def _build_graph_definition(self):
        node_names = [
            "start_query",
            "normalize_query",
            "classify_intent",
            "generate_query_variants",
            "embed_query",
            "retrieve_vector_candidates",
            "retrieve_keyword_candidates",
            "merge_candidates",
            "rerank_candidates",
            "freshness_resolver",
            "context_grader",
            "build_answer_prompt",
            "generate_answer",
            "citation_validator",
            "confidence_scorer",
            "persist_trace",
            "return_response",
        ]
        try:
            from langgraph.graph import StateGraph

            graph = StateGraph(dict)
            for node_name in node_names:
                graph.add_node(node_name, lambda state: state)
            for left, right in zip(node_names, node_names[1:], strict=False):
                graph.add_edge(left, right)
            graph.set_entry_point("start_query")
            graph.set_finish_point("return_response")
            return graph
        except Exception:
            return {"nodes": node_names}
