# Codex Build Prompt: PolicyBot Intelligence — Backend + Frontend Implementation Only

You are Codex working inside the existing **PolicyBot Intelligence** repository.

The repository already contains these top-level folders:

```text
backend/
frontend/
docs/
diagrams/
examples/
templates/
.vscode/
README.md
```

## Very Important Scope Rule

Work only on the existing:

```text
backend/
frontend/
```

Do **not** create another nested root folder like:

```text
policybot-intelligence/
```

Do **not** rebuild the repository structure from scratch.

Do **not** overwrite existing documentation, diagrams, examples, or templates unless the user explicitly asks.

Use the existing architecture and documentation as reference, but implement code only inside:

```text
backend/
frontend/
```

You may create or update files inside these two folders only.

---

# 1. Product Goal

Build **PolicyBot Intelligence**, an advanced scalable RAG system.

The app must allow users to:

1. Connect a local folder or Google Drive source.
2. Ingest many documents.
3. Extract metadata from each document.
4. Chunk documents.
5. Generate embeddings.
6. Store document metadata in MongoDB.
7. Store vectors in a vector database.
8. Use Qdrant as the default free/local vector database.
9. Keep Pinecone, Chroma, and MongoDB Atlas Vector Search as switchable adapters.
10. Ask questions across many documents.
11. Prefer the most updated document when multiple documents contain similar answers.
12. Show citations.
13. Show answer confidence.
14. Show retrieval score.
15. Show freshness score.
16. Show RAG trace in UI.
17. Show how the answer was produced using operational trace steps.
18. Support multi-model LLM switching.
19. Use Gemini as the default LLM provider for now.
20. Keep UI modern using React, TypeScript, Vite, and Tailwind CSS.

---

# 2. Main Implementation Rule

This must not be a basic chatbot.

Build a proper production-style RAG architecture with:

- OOP
- abstraction layers
- dependency injection
- async services
- clean provider switching
- vector DB abstraction
- Google Drive integration
- traceability
- scoring
- evaluation-ready structure
- polished frontend

The backend must not directly depend on Gemini, Qdrant, or MongoDB inside business logic.

The RAG pipeline should depend on interfaces and factories.

---

# 3. Backend Folder Target Structure

Create or update only this structure inside the existing `backend/` folder:

```text
backend/
  Dockerfile
  requirements.txt
  pyproject.toml
  .env.example

  app/
    __init__.py
    main.py

    api/
      __init__.py
      v1/
        __init__.py
        router.py
        health.py
        config.py
        sources.py
        ingestion.py
        query.py
        traces.py
        evaluation.py
        google_drive.py

    core/
      __init__.py
      config.py
      logging.py
      exceptions.py
      security.py
      constants.py

    db/
      __init__.py
      mongodb.py
      indexes.py
      repositories/
        __init__.py
        base_repository.py
        source_repository.py
        document_repository.py
        document_version_repository.py
        chunk_repository.py
        ingestion_job_repository.py
        query_session_repository.py
        trace_repository.py
        evaluation_repository.py
        config_repository.py

    models/
      __init__.py
      source.py
      document.py
      chunk.py
      ingestion_job.py
      query.py
      trace.py
      evaluation.py
      config.py

    schemas/
      __init__.py
      common.py
      health.py
      config.py
      source.py
      ingestion.py
      query.py
      trace.py
      evaluation.py
      google_drive.py

    providers/
      __init__.py
      base_llm.py
      base_embedding.py
      gemini_provider.py
      openai_provider.py
      anthropic_provider.py
      local_provider.py
      provider_factory.py

    vectorstores/
      __init__.py
      base_vector_store.py
      qdrant_store.py
      pinecone_store.py
      chroma_store.py
      mongo_vector_store.py
      vector_store_factory.py

    connectors/
      __init__.py
      base_connector.py
      local_folder_connector.py
      google_drive_connector.py

    ingestion/
      __init__.py
      document_loader.py
      metadata_extractor.py
      chunking.py
      hash_service.py
      ingestion_service.py
      ingestion_job_service.py

    rag/
      __init__.py
      query_models.py
      retrieval_service.py
      freshness_resolver.py
      reranker.py
      context_grader.py
      prompt_builder.py
      answer_service.py
      citation_service.py
      scoring_service.py
      rag_graph.py

    observability/
      __init__.py
      trace_service.py
      metrics_service.py
      log_event.py

    evaluation/
      __init__.py
      eval_service.py
      golden_dataset_service.py
      accuracy_service.py

    tests/
      __init__.py
      test_health.py
      test_config.py
      test_provider_factory.py
      test_vector_store_factory.py
      test_chunking.py
      test_freshness_resolver.py
      test_scoring.py
```

---

# 4. Frontend Folder Target Structure

Create or update only this structure inside the existing `frontend/` folder:

```text
frontend/
  Dockerfile
  package.json
  package-lock.json
  vite.config.ts
  tailwind.config.ts
  postcss.config.js
  tsconfig.json
  index.html
  .env.example

  src/
    main.tsx
    App.tsx

    api/
      client.ts
      health.api.ts
      config.api.ts
      sources.api.ts
      ingestion.api.ts
      query.api.ts
      traces.api.ts
      evaluation.api.ts
      googleDrive.api.ts

    components/
      ui/
        Button.tsx
        Card.tsx
        Badge.tsx
        Input.tsx
        Select.tsx
        Modal.tsx
        Progress.tsx
        Spinner.tsx
        EmptyState.tsx
        ScoreMeter.tsx
        Timeline.tsx
      layout/
        Sidebar.tsx
        Header.tsx
        PageShell.tsx
      rag/
        CitationPanel.tsx
        TraceTimeline.tsx
        ScoreBreakdown.tsx
        RetrievedChunkCard.tsx
        FreshnessDecisionCard.tsx

    features/
      dashboard/
        DashboardCards.tsx
        DashboardPage.tsx
      sources/
        SourcesPage.tsx
        LocalFolderSourceCard.tsx
        GoogleDriveConnectButton.tsx
        DrivePickerModal.tsx
        SelectedDriveSourceCard.tsx
      ingestion/
        IngestionPage.tsx
        IngestionJobStatus.tsx
        IngestionLogPanel.tsx
      chat/
        ChatPage.tsx
        ChatInput.tsx
        AnswerCard.tsx
        QueryTracePreview.tsx
      trace/
        TraceDetailsPage.tsx
      evaluation/
        EvaluationPage.tsx
        GoldenDatasetTable.tsx
        EvalRunDetails.tsx
      settings/
        SettingsPage.tsx
        ProviderSettings.tsx
        VectorStoreSettings.tsx
        ThemeSettings.tsx

    layouts/
      AppLayout.tsx

    pages/
      DashboardPage.tsx
      SourcesPage.tsx
      IngestionPage.tsx
      ChatPage.tsx
      TracePage.tsx
      EvaluationPage.tsx
      SettingsPage.tsx
      LogsPage.tsx

    router/
      routes.tsx

    stores/
      appStore.ts
      themeStore.ts
      settingsStore.ts

    styles/
      index.css
      themes.css

    theme/
      ThemeProvider.tsx
      theme.types.ts
      theme.constants.ts
      theme.utils.ts

    types/
      api.types.ts
      source.types.ts
      query.types.ts
      trace.types.ts
      evaluation.types.ts

    utils/
      cn.ts
      format.ts
      score.ts
```

---

# 5. Backend Technical Requirements

## 5.1 FastAPI App

Create a clean FastAPI app inside:

```text
backend/app/main.py
```

Required:

- CORS configured from settings.
- API prefix from settings.
- Central router.
- Startup event initializes MongoDB and vector store.
- Shutdown event closes MongoDB client.
- Structured logs.
- Error handling.

Minimum routes:

```text
GET  /api/v1/health
GET  /api/v1/config
PATCH /api/v1/config

GET  /api/v1/sources
POST /api/v1/sources/local-folder
POST /api/v1/sources/google-drive
DELETE /api/v1/sources/{source_id}

POST /api/v1/ingestion/jobs
GET  /api/v1/ingestion/jobs
GET  /api/v1/ingestion/jobs/{job_id}

POST /api/v1/query
GET  /api/v1/query/sessions
GET  /api/v1/query/sessions/{session_id}

GET  /api/v1/traces/{trace_id}

POST /api/v1/evaluation/datasets
GET  /api/v1/evaluation/datasets
POST /api/v1/evaluation/run
GET  /api/v1/evaluation/runs
GET  /api/v1/evaluation/runs/{run_id}

GET  /api/v1/google-drive/config
GET  /api/v1/google-drive/oauth/start
GET  /api/v1/google-drive/oauth/callback
POST /api/v1/google-drive/picker-selection
POST /api/v1/google-drive/folder-sync
GET  /api/v1/google-drive/sources
```

---

## 5.2 Configuration

Create:

```text
backend/app/core/config.py
```

Use Pydantic Settings.

Required env values:

```env
APP_NAME=PolicyBot Intelligence
APP_ENV=local
API_PREFIX=/api/v1
BACKEND_CORS_ORIGINS=http://localhost:5173,http://localhost:3000

MONGODB_URI=mongodb://mongodb:27017
MONGODB_DB=policybot

VECTOR_DB_PROVIDER=qdrant
QDRANT_URL=http://qdrant:6333
QDRANT_COLLECTION=policybot_chunks
QDRANT_VECTOR_SIZE=768

LLM_PROVIDER=gemini
EMBEDDING_PROVIDER=gemini
GEMINI_API_KEY=
GEMINI_CHAT_MODEL=gemini-1.5-flash
GEMINI_EMBEDDING_MODEL=text-embedding-004

OPENAI_API_KEY=
OPENAI_CHAT_MODEL=
OPENAI_EMBEDDING_MODEL=

ANTHROPIC_API_KEY=
ANTHROPIC_CHAT_MODEL=

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_CHAT_MODEL=llama3.1
OLLAMA_EMBEDDING_MODEL=nomic-embed-text

PINECONE_API_KEY=
PINECONE_INDEX_NAME=

CHROMA_HOST=
CHROMA_PORT=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_API_KEY=
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/google-drive/oauth/callback
GOOGLE_DRIVE_SCOPES=https://www.googleapis.com/auth/drive.file

CHUNK_SIZE=1000
CHUNK_OVERLAP=150
TOP_K=8
RERANK_TOP_K=5
TRACE_ENABLED=true
EVAL_ENABLED=true
LOG_LEVEL=INFO
```

Important:

- Do not hardcode provider values.
- Use settings everywhere.
- Factories should read settings.

---

## 5.3 Provider Abstraction

Create:

```text
backend/app/providers/base_llm.py
backend/app/providers/base_embedding.py
```

Required classes:

```python
from abc import ABC, abstractmethod
from pydantic import BaseModel


class LLMResponse(BaseModel):
    text: str
    model: str
    provider: str
    input_tokens: int | None = None
    output_tokens: int | None = None
    latency_ms: int | None = None
    raw: dict | None = None


class BaseLLMProvider(ABC):
    @abstractmethod
    async def generate(
        self,
        prompt: str,
        system_prompt: str | None = None,
        temperature: float = 0.2,
    ) -> LLMResponse:
        pass
```

```python
from abc import ABC, abstractmethod


class BaseEmbeddingProvider(ABC):
    @abstractmethod
    async def embed_texts(self, texts: list[str]) -> list[list[float]]:
        pass

    @abstractmethod
    async def embed_query(self, query: str) -> list[float]:
        pass
```

Implement:

```text
GeminiProvider
OpenAIProvider
AnthropicProvider
LocalProvider
ProviderFactory
```

Rules:

- Gemini provider should be functional.
- Others can be skeletons that raise `NotConfiguredError` if keys are missing.
- RAG pipeline must use `BaseLLMProvider` and `BaseEmbeddingProvider`.
- No direct Gemini import inside RAG services.

---

## 5.4 Vector Store Abstraction

Create:

```text
backend/app/vectorstores/base_vector_store.py
```

Required models/classes:

```python
from abc import ABC, abstractmethod
from pydantic import BaseModel
from typing import Any


class VectorChunk(BaseModel):
    chunk_id: str
    document_id: str
    source_id: str
    text: str
    vector: list[float]
    payload: dict[str, Any]


class VectorSearchResult(BaseModel):
    chunk_id: str
    document_id: str
    source_id: str
    text: str
    score: float
    payload: dict[str, Any]


class BaseVectorStore(ABC):
    @abstractmethod
    async def ensure_collection(self) -> None:
        pass

    @abstractmethod
    async def upsert_chunks(self, chunks: list[VectorChunk]) -> None:
        pass

    @abstractmethod
    async def search(
        self,
        query_vector: list[float],
        filters: dict[str, Any] | None = None,
        limit: int = 8,
    ) -> list[VectorSearchResult]:
        pass

    @abstractmethod
    async def delete_by_document_id(self, document_id: str) -> None:
        pass
```

Implement:

```text
QdrantVectorStore
PineconeVectorStore
ChromaVectorStore
MongoVectorStore
VectorStoreFactory
```

Rules:

- Qdrant must work locally.
- Pinecone/Chroma/Mongo vector adapters can be skeletons but must have clean class structure.
- Vector store must be switchable from settings.
- Qdrant payload must include:
  - document_id
  - chunk_id
  - source_id
  - file_name
  - file_path
  - source_type
  - created_at
  - modified_at
  - version
  - content_hash
  - page_number
  - section_title
  - tags

---

## 5.5 MongoDB Data Layer

Use Motor async client.

Create:

```text
backend/app/db/mongodb.py
backend/app/db/indexes.py
backend/app/db/repositories/
```

Required collections:

```text
sources
documents
document_versions
chunks
ingestion_jobs
query_sessions
query_traces
eval_datasets
eval_runs
model_configs
vector_store_configs
app_settings
```

Required indexes:

```text
sources.source_id
documents.document_id
documents.source_id
documents.file_path
documents.content_hash
documents.modified_at
chunks.chunk_id
chunks.document_id
chunks.source_id
ingestion_jobs.job_id
query_sessions.session_id
query_traces.trace_id
eval_runs.run_id
```

Repository rule:

- Use async class methods.
- Repositories should not contain business logic.
- Services should call repositories.

---

## 5.6 Local Folder Ingestion

Implement inside:

```text
backend/app/connectors/local_folder_connector.py
backend/app/ingestion/
```

Supported files:

```text
.txt
.md
.pdf
.docx
.csv
```

Flow:

```text
folder path
→ scan supported files
→ extract metadata
→ calculate content hash
→ skip unchanged documents
→ load text
→ split into chunks
→ generate embeddings
→ save document metadata in MongoDB
→ save chunk metadata in MongoDB
→ save vectors in Qdrant
→ create ingestion job
→ create trace/log events
```

Acceptance:

- Local folder ingestion endpoint accepts folder path.
- Ingestion job status is stored.
- Duplicate unchanged files are skipped.
- Modified files create new version.
- Errors are saved in ingestion job logs.

---

## 5.7 Google Drive Integration

Implement Google Drive as source type.

Frontend must have button:

```text
Connect Google Drive
```

User flow:

```text
Connect Google Drive
→ authenticate
→ open Google Picker
→ select files or folder
→ show selected item card
→ Start Indexing
→ show ingestion progress
```

Backend endpoints:

```text
GET  /api/v1/google-drive/config
GET  /api/v1/google-drive/oauth/start
GET  /api/v1/google-drive/oauth/callback
POST /api/v1/google-drive/picker-selection
POST /api/v1/google-drive/folder-sync
GET  /api/v1/google-drive/sources
```

Rules:

- Support Picker Mode first.
- Add Folder Sync backend structure.
- Use least-privilege scope by default.
- Make Drive scopes configurable.
- Reuse same ingestion pipeline after files are downloaded/exported.

---

## 5.8 RAG LangGraph Flow

Implement:

```text
backend/app/rag/rag_graph.py
```

Use LangGraph with these nodes:

```text
start_query
normalize_query
classify_intent
generate_query_variants
embed_query
retrieve_vector_candidates
retrieve_keyword_candidates
merge_candidates
rerank_candidates
freshness_resolver
context_grader
build_answer_prompt
generate_answer
citation_validator
confidence_scorer
persist_trace
return_response
```

RAG response schema:

```json
{
  "answer": "string",
  "citations": [
    {
      "document_id": "string",
      "file_name": "string",
      "file_path": "string",
      "chunk_id": "string",
      "page_number": 1,
      "score": 0.91,
      "created_at": "date",
      "modified_at": "date",
      "snippet": "string"
    }
  ],
  "scores": {
    "retrieval_score": 0.0,
    "freshness_score": 0.0,
    "context_relevance_score": 0.0,
    "citation_quality_score": 0.0,
    "answer_confidence": 0.0
  },
  "trace_id": "string",
  "session_id": "string",
  "model": "string",
  "embedding_model": "string",
  "vector_db": "qdrant",
  "latency_ms": 0
}
```

Important behavior:

- Prefer latest valid document when multiple documents answer the same query.
- Use `modified_at`, `created_at`, `version`, and `ingested_at`.
- If old and new documents conflict, select latest valid document.
- Explain freshness decision in operational trace.
- Do not expose hidden reasoning.
- Show operational trace only.

---

## 5.9 Trace Service

Create:

```text
backend/app/observability/trace_service.py
```

Trace every RAG step:

```text
query_received
query_normalized
intent_classified
query_variants_generated
query_embedded
vector_candidates_retrieved
keyword_candidates_retrieved
candidates_merged
candidates_reranked
freshness_resolved
context_graded
prompt_built
answer_generated
citations_validated
confidence_scored
trace_persisted
response_returned
```

Each trace event should include:

```json
{
  "step": "string",
  "status": "started | completed | failed",
  "input_summary": {},
  "output_summary": {},
  "latency_ms": 0,
  "timestamp": "date"
}
```

---

## 5.10 Scoring

Implement:

```text
backend/app/rag/scoring_service.py
```

Required scores:

```text
retrieval_score
freshness_score
context_relevance_score
citation_quality_score
answer_confidence
latency_score
```

Scores should be explainable and visible in frontend.

---

# 6. Frontend Technical Requirements

## 6.1 React + Tailwind App

Use:

```text
React
TypeScript
Vite
Tailwind CSS
React Router
TanStack Query
Zustand or Context
```

Required routes:

```text
/dashboard
/sources
/ingestion
/chat
/traces/:traceId
/evaluation
/settings
/logs
```

---

## 6.2 UI Layout

Create:

```text
Sidebar
Header
PageShell
```

Header should show:

```text
PolicyBot Intelligence
Active LLM Provider
Active Model
Active Vector DB
Theme selector
```

Sidebar links:

```text
Dashboard
Sources
Ingestion
Chat
Traces
Evaluation
Settings
Logs
```

---

## 6.3 Theme System

Create CSS variable based theme system.

Required themes:

```text
black/dark
white/light
blue
red
gradient
custom
```

Theme features:

- theme selector in header/settings
- custom primary color picker
- gradient toggle
- save theme in localStorage
- apply theme without reload

Theme must affect:

```text
buttons
active sidebar
badges
score meters
cards
links
focus rings
progress bars
selected tabs
```

---

## 6.4 Dashboard Page

Dashboard should show cards:

```text
Documents Indexed
Chunks Indexed
Sources Connected
Running Jobs
Average Confidence
Latest Query Latency
Active LLM Provider
Active Vector DB
```

Add basic charts if possible:

```text
queries over time
confidence trend
ingestion status
```

Use mock fallback only if backend endpoint is missing, but clearly structure API integration.

---

## 6.5 Sources Page

Sources page must support:

```text
Local Folder Source
Google Drive Source
Connected Sources List
Source Status
Start Ingestion
Delete Source
```

Components:

```text
LocalFolderSourceCard
GoogleDriveConnectButton
DrivePickerModal
SelectedDriveSourceCard
```

Local folder:

- input field for path
- submit button
- create source call

Google Drive:

- Connect button
- auth state
- picker modal
- selected files/folder card
- start indexing button

---

## 6.6 Chat Page

Chat page must include:

```text
question input
submit button
answer card
citations panel
score breakdown
trace preview
model info
vector DB info
latency
```

After answer:

- show citations
- show answer confidence
- show retrieval score
- show freshness score
- show selected latest document logic
- provide link/button to full trace page

---

## 6.7 Trace Page

Trace page must show:

```text
trace timeline
retrieved chunks
reranked chunks
freshness decision
selected context
citation validation
score breakdown
latency breakdown
model and vector DB used
```

This page should make the system look intelligent by showing the operational RAG process.

---

## 6.8 Evaluation Page

Evaluation page must show:

```text
golden dataset table
run evaluation button
accuracy percentage
passed/failed cases
weak sources
average confidence
```

---

## 6.9 Settings Page

Settings page must allow changing:

```text
LLM provider
chat model
embedding provider
embedding model
vector DB provider
chunk size
chunk overlap
top-k
reranking toggle
theme
custom color
gradient mode
```

Persist UI settings locally.

Backend config update can be wired to `/api/v1/config`.

---

# 7. Build Chronology

Follow this exact chronological order.

## Phase 1 — Existing Folder Audit

1. Inspect existing `backend/` and `frontend/`.
2. Do not delete working code.
3. Identify missing files.
4. Add only missing structure.
5. If a file exists, update carefully.

Output after phase:

```text
Backend existing files checked
Frontend existing files checked
Missing files created
No duplicate root folder created
```

---

## Phase 2 — Backend Foundation

1. Create FastAPI app.
2. Add settings.
3. Add logging.
4. Add exceptions.
5. Add CORS.
6. Add v1 router.
7. Add health endpoint.
8. Add startup connection checks.

Acceptance:

```text
GET /api/v1/health works
```

---

## Phase 3 — Frontend Foundation

1. Ensure Vite + React + TypeScript works.
2. Add Tailwind config.
3. Add router.
4. Add app layout.
5. Add API client.
6. Add health call.
7. Add dashboard shell.

Acceptance:

```text
frontend starts with npm run dev
dashboard loads
health status visible
```

---

## Phase 4 — Docker and Local Dev

Inside backend and frontend only:

1. Create/update `backend/Dockerfile`.
2. Create/update `frontend/Dockerfile`.
3. Ensure backend reads env correctly.
4. Ensure frontend reads API base URL correctly.

Do not edit root Docker Compose unless absolutely required. If needed, print what should be added to root docker-compose instead of directly modifying it.

Acceptance:

```text
backend image can build
frontend image can build
```

---

## Phase 5 — MongoDB Layer

1. Add MongoDB async client.
2. Add repositories.
3. Add indexes.
4. Add health check.
5. Add schemas/models.

Acceptance:

```text
MongoDB status appears in health endpoint
```

---

## Phase 6 — Vector DB Layer

1. Add base vector store.
2. Add Qdrant implementation.
3. Add vector store factory.
4. Add Pinecone/Chroma/Mongo skeletons.
5. Add Qdrant health check.
6. Add collection initialization.

Acceptance:

```text
Qdrant status appears in health endpoint
Qdrant collection is created
```

---

## Phase 7 — Provider Layer

1. Add LLM base interface.
2. Add embedding base interface.
3. Add Gemini provider.
4. Add OpenAI/Anthropic/local skeletons.
5. Add provider factory.

Acceptance:

```text
ProviderFactory returns Gemini provider from env
RAG services do not directly import Gemini
```

---

## Phase 8 — Ingestion

1. Add local folder connector.
2. Add metadata extractor.
3. Add hash service.
4. Add document loader.
5. Add chunking service.
6. Add ingestion service.
7. Add ingestion endpoints.
8. Add ingestion job status.

Acceptance:

```text
POST /api/v1/sources/local-folder creates source
POST /api/v1/ingestion/jobs starts ingestion
GET /api/v1/ingestion/jobs/{job_id} shows progress
```

---

## Phase 9 — RAG Query

1. Add retrieval service.
2. Add freshness resolver.
3. Add reranker.
4. Add context grader.
5. Add prompt builder.
6. Add answer service.
7. Add citation service.
8. Add scoring service.
9. Add LangGraph graph.
10. Add query endpoint.

Acceptance:

```text
POST /api/v1/query returns answer, citations, scores, trace_id
```

---

## Phase 10 — Trace UI

1. Add backend trace service.
2. Add trace repository.
3. Add trace endpoint.
4. Add frontend trace timeline.
5. Add trace details page.

Acceptance:

```text
GET /api/v1/traces/{trace_id} returns trace
Frontend shows trace timeline
```

---

## Phase 11 — Google Drive

1. Add backend Google Drive config endpoint.
2. Add frontend Google Drive button.
3. Add auth state.
4. Add Google Picker loader.
5. Add file/folder selection UI.
6. Add selected Drive source card.
7. Add indexing button.
8. Add backend picker selection endpoint.
9. Add folder sync structure.

Acceptance:

```text
User can click Connect Google Drive
Picker flow is wired
Selected files/folder can be sent to backend
```

---

## Phase 12 — Evaluation

1. Add evaluation services.
2. Add evaluation endpoints.
3. Add frontend evaluation page.
4. Add dataset table.
5. Add run evaluation button.
6. Add accuracy dashboard.

Acceptance:

```text
Evaluation page exists
Evaluation endpoints are wired
```

---

## Phase 13 — UI Polish

1. Add all required themes.
2. Add custom color picker.
3. Add gradient mode.
4. Add score meters.
5. Add cards and badges.
6. Add responsive layout.
7. Remove ugly/plain UI.

Acceptance:

```text
UI looks professional
Theme changes without reload
Theme persists in localStorage
```

---

## Phase 14 — Tests

Backend tests:

```text
health
config
provider factory
vector store factory
chunking
freshness resolver
scoring
```

Frontend tests:

```text
app renders
theme switch works
chat page renders
sources page renders
```

Acceptance:

```text
pytest works for backend
npm test or npm run test works for frontend if test setup exists
```

---

# 8. Implementation Quality Rules

Follow these rules strictly:

1. Work only inside `backend/` and `frontend/`.
2. Do not create duplicate repository root.
3. Do not delete existing useful code.
4. Use OOP for services.
5. Use abstract base classes for providers, vector stores, and connectors.
6. Use async I/O for DB, vector DB, and external calls.
7. Use type hints everywhere.
8. Use Pydantic schemas.
9. Keep files focused.
10. Do not hardcode API keys.
11. Do not hardcode Gemini inside RAG pipeline.
12. Do not hardcode Qdrant inside RAG pipeline.
13. Do not return fake success for real backend actions.
14. Optional providers can raise clear `NotConfiguredError`.
15. Log service boundary events.
16. Persist trace events for RAG steps.
17. Keep frontend components reusable.
18. Keep UI clean, modern, and responsive.
19. Avoid overly complex clever code.
20. Prefer maintainability and performance.

---

# 9. API Response Standards

Use consistent response format.

Success response:

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed"
}
```

Error response:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

Query response:

```json
{
  "success": true,
  "data": {
    "answer": "string",
    "citations": [],
    "scores": {
      "retrieval_score": 0.0,
      "freshness_score": 0.0,
      "context_relevance_score": 0.0,
      "citation_quality_score": 0.0,
      "answer_confidence": 0.0
    },
    "trace_id": "string",
    "session_id": "string",
    "model": "string",
    "embedding_model": "string",
    "vector_db": "qdrant",
    "latency_ms": 0
  }
}
```

---

# 10. First MVP Path

Build this MVP first:

```text
backend health
frontend dashboard
MongoDB health
Qdrant health
Gemini provider abstraction
local folder ingestion
Qdrant vector storage
Mongo metadata
RAG query
citations
trace endpoint
chat UI
trace UI
```

Then add:

```text
Google Drive
evaluation
advanced UI polish
```

---

# 11. Final Output Required From Codex

After implementation, print:

```text
What was changed in backend/
What was changed in frontend/
Commands to run backend
Commands to run frontend
Environment variables still needed
Known limitations
Next recommended task
```

Do not claim a feature is fully working unless the code actually implements it.

Begin with Phase 1: audit existing backend and frontend folders.
