# Product Brief for Client

**Client-facing explanation of PolicyBot Intelligence**

Project: **PolicyBot Intelligence**  
Updated: **2026-06-18**

---


PolicyBot Intelligence is an advanced RAG system for answering policy/document questions using multiple documents, freshness-aware source selection, traceable reasoning steps, model-provider switching, and retrieval quality scoring. The system watches or syncs a local/Drive folder, extracts document metadata, chunks content, embeds chunks, stores vectors in a real vector database, stores document metadata and traces in MongoDB, then uses a LangGraph workflow to retrieve, rerank, verify, and answer with citations.

The recommended MVP stack is: React + Tailwind frontend, FastAPI backend, LangGraph orchestration, LangChain integrations, Gemini API for generation and embeddings, MongoDB for metadata/audit/history, Qdrant or Pinecone as the vector database, Redis for background job queues/cache, Docker Compose for local development, and a cloud/container deployment path for production.

## 1. Product vision

PolicyBot Intelligence is a document-aware AI assistant that helps users ask questions across company policies, HR documents, legal files, process manuals, compliance PDFs, operational SOPs, and internal knowledge folders. Instead of manually searching many files, users ask a question and receive a clear answer with supporting sources, document freshness indicators, and a visible process trail.

The product is designed for organizations where policies change frequently and old documents create confusion. A normal chatbot may answer from outdated content. PolicyBot solves this by checking file metadata, version dates, creation dates, modified dates, effective dates inside documents, and retrieval confidence before generating an answer.

## 2. Client problem

Many companies store policies in folders, drives, shared spaces, and PDFs. Common problems are:

- employees do not know which document is latest,
- multiple files contain related information,
- outdated documents remain in shared folders,
- answers are hard to audit,
- teams cannot see why an AI produced an answer,
- internal documents are too large to manually review,
- policy interpretation depends on context across multiple files.

## 3. Product solution

PolicyBot ingests files from a configured folder, extracts text and metadata, stores document records in MongoDB, stores semantic embeddings in a vector database, and uses an intelligent graph workflow to answer questions. The answer includes citations, source file names, freshness notes, confidence scores, and step-by-step processing traces.

## 4. Main capabilities

### Folder-based knowledge sync

The system can watch or scan a folder containing PDFs, DOCX files, TXT files, Markdown files, CSV files, and other supported documents. Whenever a file is added or updated, it can be reprocessed and re-indexed.

### Multi-document retrieval

When a question requires information from multiple documents, the retrieval layer finds relevant chunks across many files, groups them by document, and sends only the strongest evidence into the answer generation step.

### Freshness-aware answers

If multiple documents contain similar information, the system checks document creation date, modified date, version metadata, effective date, and extracted dates from the content. The final answer prefers the latest trusted source and warns when conflicting versions exist.

### Traceable intelligence

Users can see the AI's process in a friendly UI timeline: question understood, query rewritten, documents searched, chunks retrieved, reranking completed, freshness checked, answer generated, citations verified, and confidence calculated.

### Scoring and quality checks

Every answer receives multiple scores: retrieval relevance, citation coverage, answer confidence, freshness confidence, conflict risk, and hallucination risk.

## 5. Client value

- Faster document search.
- Lower policy confusion.
- Better auditability.
- Clear evidence behind each answer.
- Scalable knowledge base.
- Upgrade path from MVP to enterprise deployment.

## 6. MVP scope

The 10-day MVP should include:

- local folder ingestion,
- document metadata extraction,
- chunking and embedding,
- Qdrant or Pinecone vector search,
- MongoDB metadata store,
- question-answer API,
- React chat UI,
- trace timeline,
- source citations,
- freshness resolver,
- basic evaluation dashboard,
- Docker Compose setup.

## 7. Future enterprise scope

- Google Drive/SharePoint/OneDrive connectors,
- role-based document access,
- multi-tenant organizations,
- admin approval workflow,
- human feedback review queue,
- scheduled indexing,
- policy version diffing,
- red-flag detection for outdated documents,
- advanced analytics for unanswered questions,
- private model or local model deployment.

## 8. Success criteria

The project is successful when users can ask a policy question, receive an answer from the latest relevant documents, verify citations, understand why the answer was selected, and see confidence/scoring details without needing developer help.
