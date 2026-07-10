# Detailed RAG Pipeline Flow

**Ingestion-time and query-time flow**

Project: **PolicyBot Intelligence**  
Updated: **2026-06-18**

---


## 1. Why the flow matters

Advanced RAG is not just “embed documents and ask a model”. A scalable RAG system needs reliable ingestion, clean metadata, semantic search, freshness logic, reranking, citation verification, answer scoring, and traceability.

## 2. Ingestion-time flow

### Step 1: Folder scan

The scanner walks the configured folder recursively and records every supported file.

```text
/data/policies/
├── leave_policy_v2.pdf
├── leave_policy_v4.pdf
├── reimbursement_policy.docx
└── hr_handbook.md
```

### Step 2: File identity

For every file, calculate:

- file path,
- normalized path,
- size,
- extension,
- created date,
- modified date,
- content hash,
- last indexed hash.

If hash is unchanged, skip re-indexing.

### Step 3: Text extraction

Use file-specific loaders:

| File type | Loader strategy |
|---|---|
| PDF | PDF loader, OCR later if scanned |
| DOCX | Word loader |
| TXT/MD | Plain text loader |
| CSV/XLSX | Table-aware loader |
| HTML | HTML parser |

### Step 4: Metadata extraction

Extract structured metadata:

- title,
- section headings,
- page numbers,
- author if available,
- version pattern like `v4`, `version 2026.1`, `rev-3`,
- effective date,
- created date,
- modified date,
- approval date,
- policy category.

### Step 5: Chunking

Recommended chunking for policy documents:

```yaml
chunk_size_tokens: 4000
chunk_overlap_tokens: 500
preserve_headings: true
preserve_page_number: true
split_by_section_first: true
```

Do not split blindly every N characters. Prefer section-aware chunking. *Note: We use large 4000 character chunks to take advantage of massive LLM contexts, which significantly reduces API calls and avoids immediate rate-limiting.*

### Step 6: Embedding

Generate embeddings for each chunk. Store embedding model and dimension with the chunk metadata. If embedding model changes, re-index all chunks. 
*Note: The embedding pipeline has built-in automated exponential backoff. If it hits a `429 Quota Exceeded` error (e.g., from Google Gemini's 100 RPM limit), it will silently pause for 30 seconds and retry. See `12_INGESTION_OPTIMIZATION.md` for the full technical and layman's breakdown.*

### Step 7: Vector DB upsert

Upsert chunk vectors into vector DB using stable IDs:

```text
{document_id}:{content_hash}:{chunk_index}
```

Payload metadata should include enough fields for filtering and display.

### Step 8: MongoDB record write

MongoDB stores full document metadata, chunk metadata, ingestion jobs, and errors.

## 3. Query-time flow

### Step 1: User question

User asks:

```text
What is the latest maternity leave policy?
```

### Step 2: Trace ID creation

Backend creates:

```text
trace_id = trace_20260618_abc123
```

Every event is linked to this ID.

### Step 3: Query classification

Classify question intent:

- policy lookup,
- comparison,
- summarization,
- procedure question,
- eligibility question,
- unsupported/general question.

### Step 4: Query rewrite

Rewrite for retrieval:

```text
latest maternity leave policy eligibility duration effective date
```

### Step 5: Query embedding

Generate vector embedding from rewritten query.

### Step 6: Retrieval

Retrieve from vector DB:

```yaml
top_k_initial: 30
metadata_filters:
  organization_id: current_org
  status: indexed
```

### Step 7: Hybrid search if available

Use dense vector + keyword/BM25 when available. Hybrid search improves performance for exact policy terms, acronyms, section names, and dates.

### Step 8: Reranking

Rerank top candidates using:

- semantic score,
- keyword overlap,
- section title match,
- document trust,
- freshness signal,
- citation density.

### Step 9: Freshness resolution

Group results by policy topic and compare dates/versions:

```text
leave_policy_v4.pdf   effective 2026-06-01  selected
leave_policy_v2.pdf   effective 2024-04-01  older conflict
```

### Step 10: Context assembly

Build compact model context:

```text
Source 1: leave_policy_v4.pdf, page 3, section Maternity Leave
Excerpt: ...

Source 2: hr_handbook.md, section Benefits
Excerpt: ...
```

### Step 11: Answer generation

The answer prompt must require:

- answer only from sources,
- cite sources,
- mention uncertainty,
- mention conflict if present,
- prefer latest effective document.

### Step 12: Verification

Check:

- each citation maps to a retrieved chunk,
- answer claims are supported by retrieved evidence,
- old source was not used incorrectly,
- no unsupported claim was generated.

### Step 13: Scoring

Calculate:

```json
{
  "retrieval_relevance": 0.89,
  "answer_confidence": 0.84,
  "citation_coverage": 0.92,
  "freshness_confidence": 0.95,
  "conflict_risk": 0.21
}
```

### Step 14: UI response

Return:

- final answer,
- citations,
- source cards,
- trace ID,
- trace timeline,
- scores,
- warnings.

## 4. Conflict handling

If sources disagree, do not hide it. Return:

```text
The latest available document appears to be leave_policy_v4.pdf, effective June 1, 2026. An older file, leave_policy_v2.pdf, contains different leave duration information, so I am using v4 as the current source.
```

## 5. No-answer handling

If retrieval quality is low:

```text
I could not find enough relevant information in the indexed documents to answer this confidently.
```

Do not hallucinate.
