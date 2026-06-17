# 10-Day Build Plan

**Realistic execution plan for MVP**

Project: **PolicyBot Intelligence**  
Updated: **2026-06-18**

---


## 1. Goal

Build a strong MVP of PolicyBot Intelligence in 10 days with real RAG, vector DB, metadata, freshness checks, trace UI, scoring, Docker setup, and basic evaluation.

## Day 1: Project setup and architecture skeleton

Deliverables:

- Git repo structure.
- FastAPI app skeleton.
- React + Tailwind app skeleton.
- Docker Compose with MongoDB, Redis, Qdrant.
- `.env.example`.
- Health endpoints.

Acceptance:

- `docker compose up` starts services.
- Backend docs open at `/docs`.
- Frontend opens locally.

## Day 2: MongoDB schemas and vector DB adapter

Deliverables:

- MongoDB connection.
- Repository layer.
- Collections/index creation command.
- `VectorStoreAdapter` interface.
- Qdrant implementation.
- Pinecone placeholder implementation.

Acceptance:

- Can create Qdrant collection.
- Can upsert/search dummy vectors.
- MongoDB indexes are created.

## Day 3: Document ingestion pipeline

Deliverables:

- Folder scanner.
- File hash detection.
- Basic loaders for PDF, DOCX, TXT, MD.
- Metadata extraction.
- Chunking.

Acceptance:

- Can scan folder and create document/chunk records.
- Unchanged files are skipped.

## Day 4: Embeddings and vector indexing

Deliverables:

- Gemini embedding provider.
- Batch embedding.
- Vector DB upsert.
- Reindex document command.
- Delete vectors by document ID.

Acceptance:

- Real document chunks are searchable by semantic query.

## Day 5: LangGraph RAG workflow

Deliverables:

- Graph state.
- Query rewrite node.
- Embed query node.
- Retrieve candidates node.
- Rerank node.
- Context builder node.
- Gemini answer generation node.

Acceptance:

- `/chat/ask` returns answer with sources.

## Day 6: Freshness resolver and conflict detection

Deliverables:

- Effective date extraction.
- Version extraction.
- Freshness ranking.
- Conflict detection.
- Source freshness labels.

Acceptance:

- If old and new documents match, latest is preferred.
- Conflicts appear in response warnings.

## Day 7: Trace timeline and frontend chat

Deliverables:

- Trace event writer.
- SSE trace stream.
- Chat page.
- Trace timeline component.
- Source cards.

Acceptance:

- User can ask a question and watch steps.

## Day 8: Scoring and evaluation dashboard

Deliverables:

- Retrieval score.
- Citation coverage score.
- Freshness confidence score.
- Conflict risk score.
- Evaluation dataset format.
- Evaluation page.

Acceptance:

- Each answer shows scores.
- Evaluation run can test sample questions.

## Day 9: Document admin UI and Docker polish

Deliverables:

- Documents page.
- Ingestion page.
- Job status UI.
- Docker improvements.
- Makefile commands.
- Setup docs.

Acceptance:

- Admin can sync folder and see indexed files.

## Day 10: QA, demo data, deployment prep

Deliverables:

- Test documents.
- Demo script.
- QA checklist.
- Deployment guide.
- Final README.
- Bug fixes.

Acceptance:

- Full demo works end-to-end.
- Client can understand product value.

## 2. MVP risk control

Do not overbuild these in first 10 days:

- complex auth,
- cloud file connectors,
- fancy admin dashboards,
- multiple vector DB providers fully implemented,
- deep analytics.

Build clean interfaces first, implement Qdrant fully, then Pinecone next.

## 3. Best delivery strategy

Use this order:

```text
Working RAG core → source quality → trace UI → scoring → admin polish
```

Do not start with only UI. The core value is retrieval quality.
