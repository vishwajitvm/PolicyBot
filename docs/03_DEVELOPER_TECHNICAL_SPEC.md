# Developer Technical Specification

**Implementation-level plan for backend, frontend, DB, vector DB, and model adapters**

Project: **PolicyBot Intelligence**  
Updated: **2026-06-18**

---


## 1. Target technology stack

| Area | Technology |
|---|---|
| Backend API | Python, FastAPI, Pydantic, Uvicorn |
| Workflow | LangGraph |
| RAG utilities | LangChain |
| LLM provider | Gemini API first, switchable later |
| Embeddings | Gemini embedding model first, switchable later |
| Metadata DB | MongoDB |
| Vector DB | Qdrant local/self-host for dev, Pinecone for managed cloud option |
| Background jobs | Redis + RQ/Celery/Arq worker |
| Frontend | React, Vite, Tailwind, TanStack Query |
| Realtime UI | Server-Sent Events first; WebSocket later if needed |
| Deployment | Docker Compose locally, cloud containers later |

## 2. Recommended repository structure

```text
policybot/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── chat.py
│   │   │       ├── documents.py
│   │   │       ├── ingestion.py
│   │   │       ├── evaluations.py
│   │   │       └── health.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── logging.py
│   │   │   ├── security.py
│   │   │   └── exceptions.py
│   │   ├── db/
│   │   │   ├── mongo.py
│   │   │   ├── repositories.py
│   │   │   └── indexes.py
│   │   ├── vectorstores/
│   │   │   ├── base.py
│   │   │   ├── qdrant_store.py
│   │   │   ├── pinecone_store.py
│   │   │   ├── chroma_store.py
│   │   │   └── mongodb_atlas_store.py
│   │   ├── models/
│   │   │   ├── llm_base.py
│   │   │   ├── gemini_provider.py
│   │   │   ├── openai_provider.py
│   │   │   └── ollama_provider.py
│   │   ├── ingestion/
│   │   │   ├── scanner.py
│   │   │   ├── loaders.py
│   │   │   ├── parser.py
│   │   │   ├── chunker.py
│   │   │   ├── metadata.py
│   │   │   └── pipeline.py
│   │   ├── rag/
│   │   │   ├── graph.py
│   │   │   ├── state.py
│   │   │   ├── retriever.py
│   │   │   ├── freshness.py
│   │   │   ├── reranker.py
│   │   │   ├── answerer.py
│   │   │   ├── verifier.py
│   │   │   └── scorer.py
│   │   ├── observability/
│   │   │   ├── trace_writer.py
│   │   │   ├── event_stream.py
│   │   │   └── metrics.py
│   │   ├── workers/
│   │   │   └── ingestion_worker.py
│   │   └── cli/
│   │       ├── ingest.py
│   │       ├── evaluate.py
│   │       └── create_indexes.py
│   ├── tests/
│   ├── Dockerfile
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── types/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 3. Service boundaries

### API service

Responsible for HTTP endpoints, request validation, auth, chat API, document listing, ingestion trigger, and trace streaming.

### Ingestion worker

Responsible for scanning folders, parsing documents, chunking, embedding, vector DB upsert, and MongoDB metadata updates. This should not block the main API request thread.

### RAG graph service

Responsible for query-time graph execution: understand query, rewrite, retrieve, rerank, freshness resolve, generate, verify, score, trace.

### Vector store adapter

Responsible for hiding vendor-specific vector DB code behind one interface. This is mandatory because you want to switch between Qdrant, Pinecone, Chroma, or MongoDB Atlas Vector Search without rewriting the RAG graph.

## 4. Core Python interfaces

```python
class VectorStoreAdapter(Protocol):
    async def upsert_chunks(self, chunks: list[ChunkRecord]) -> None: ...
    async def delete_document(self, document_id: str) -> None: ...
    async def similarity_search(self, query_vector: list[float], filters: dict, top_k: int) -> list[RetrievedChunk]: ...
    async def hybrid_search(self, query_text: str, query_vector: list[float], filters: dict, top_k: int) -> list[RetrievedChunk]: ...

class LLMProvider(Protocol):
    async def generate(self, messages: list[Message], response_schema: dict | None = None) -> LLMResponse: ...

class EmbeddingProvider(Protocol):
    async def embed_documents(self, texts: list[str]) -> list[list[float]]: ...
    async def embed_query(self, text: str) -> list[float]: ...
```

## 5. Development priorities

1. Build stable ingestion first.
2. Add vector DB adapter before building UI.
3. Add LangGraph trace events while building graph nodes, not later.
4. Add scoring from day one, even if initial formulas are simple.
5. Add model-provider abstraction before writing Gemini code deeply inside business logic.
6. Keep MongoDB schemas explicit and indexed.

## 6. Minimum dependencies

```txt
fastapi
uvicorn[standard]
pydantic-settings
motor
pymongo
langchain
langgraph
langchain-google-genai
langchain-qdrant
langchain-pinecone
langchain-chroma
qdrant-client
pinecone
chromadb
python-multipart
watchdog
redis
rq
structlog
pytest
httpx
```

## 7. Developer rule

Never call Gemini, Pinecone, Qdrant, MongoDB, or any specific vendor directly from API route functions. API routes should call services. Services should call adapters. This keeps the architecture scalable.
