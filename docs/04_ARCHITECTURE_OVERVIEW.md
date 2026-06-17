# Architecture Overview

**Complete system architecture with real vector DB layer**

Project: **PolicyBot Intelligence**  
Updated: **2026-06-18**

---


PolicyBot Intelligence is an advanced RAG system for answering policy/document questions using multiple documents, freshness-aware source selection, traceable reasoning steps, model-provider switching, and retrieval quality scoring. The system watches or syncs a local/Drive folder, extracts document metadata, chunks content, embeds chunks, stores vectors in a real vector database, stores document metadata and traces in MongoDB, then uses a LangGraph workflow to retrieve, rerank, verify, and answer with citations.

The recommended MVP stack is: React + Tailwind frontend, FastAPI backend, LangGraph orchestration, LangChain integrations, Gemini API for generation and embeddings, MongoDB for metadata/audit/history, Qdrant or Pinecone as the vector database, Redis for background job queues/cache, Docker Compose for local development, and a cloud/container deployment path for production.

## 1. High-level architecture

```text
User Browser
   ↓
React + Tailwind UI
   ↓ HTTP/SSE
FastAPI Backend
   ↓
LangGraph RAG Workflow
   ↓
Retriever + Freshness Resolver + Scorer
   ↓
Vector DB Adapter ───────────→ Qdrant / Pinecone / Chroma / MongoDB Atlas Vector Search
   ↓
MongoDB Metadata Store ──────→ documents, chunks, traces, evaluations, feedback
   ↓
Gemini Model Gateway ────────→ generation + embeddings
```

## 2. Why this architecture is scalable

### Separate metadata from vectors

MongoDB stores business data, metadata, traces, user feedback, evaluation results, file history, and document-level information. The vector database stores embeddings and searchable payload metadata. This separation avoids mixing audit/business records with similarity-search concerns.

### Adapter-based vector database layer

The backend never hardcodes Pinecone or Qdrant logic into the RAG graph. It uses a `VectorStoreAdapter`, which allows changing the provider through environment configuration.

### Async ingestion

Large document parsing and embedding generation should happen in a worker, not inside a normal API request. This allows the API to remain responsive while ingestion jobs run in the background.

### Trace-first LangGraph design

Every major step in the RAG workflow emits trace events. This makes the UI look intelligent and gives developers the debugging information needed to improve retrieval quality.

## 3. Major components

| Component | Responsibility |
|---|---|
| React UI | Chat, document management, trace timeline, score dashboard |
| FastAPI | API gateway, validation, auth, service orchestration |
| LangGraph | Query-time RAG workflow and state transitions |
| LangChain | Loader/retriever/vector store integration utilities |
| Gemini gateway | LLM and embedding provider implementation |
| Vector DB adapter | Swappable vector store layer |
| MongoDB | Metadata, traces, evaluations, users, sessions |
| Redis | Queue, cache, rate limit, temporary state |
| Worker | Ingestion, reindexing, evaluation jobs |
| Docker Compose | Local reproducible environment |

## 4. Data flow summary

### Ingestion flow

1. Folder scanner detects files.
2. File hash is calculated.
3. Metadata is extracted.
4. Text is extracted from the document.
5. Text is chunked.
6. Embeddings are generated.
7. Chunks are upserted into vector DB.
8. Document and chunk metadata are stored in MongoDB.
9. Ingestion job status is updated.

### Query flow

1. User asks a question.
2. Backend creates a trace ID.
3. LangGraph initializes graph state.
4. Query is rewritten if needed.
5. Query embedding is generated.
6. Vector DB returns candidate chunks.
7. Candidates are reranked.
8. Freshness resolver compares document dates and versions.
9. Context is assembled.
10. Gemini generates answer.
11. Verifier checks citations and evidence.
12. Scorer calculates confidence.
13. UI receives final answer and trace events.

## 5. Storage choices

### MongoDB

Use MongoDB for:

- user records,
- document records,
- chunk metadata,
- query sessions,
- trace events,
- evaluation results,
- feedback,
- ingestion jobs.

### Vector DB

Use vector DB for:

- embeddings,
- semantic similarity search,
- metadata-filtered search,
- hybrid retrieval where supported,
- fast nearest-neighbor lookup.

Recommended local default: **Qdrant**.
Recommended managed option: **Pinecone**.
Local prototype option: **Chroma**.
Combined metadata/vector option: **MongoDB Atlas Vector Search**.

## 6. Diagrams

See:

- `diagrams/backend_architecture.png`
- `diagrams/frontend_architecture.png`
- `diagrams/full_stack_architecture.png`

Editable draw.io versions are also included.
