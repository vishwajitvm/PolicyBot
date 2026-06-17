# Frontend Architecture

**React + Tailwind UI for chat, traces, documents, and evaluation**

Project: **PolicyBot Intelligence**  
Updated: **2026-06-18**

---


## 1. Frontend goal

The frontend should make the system feel intelligent, transparent, and professional. It should not only show a chatbot answer. It should show how the answer was produced: retrieved documents, freshness checks, scores, citations, and processing steps.

## 2. Recommended frontend stack

| Area | Technology |
|---|---|
| Framework | React + Vite |
| Styling | Tailwind CSS |
| API state | TanStack Query |
| Local state | Zustand or React Context |
| Forms | React Hook Form |
| Validation | Zod |
| Streaming | Server-Sent Events for trace updates |
| Charts | Recharts or lightweight chart library |
| Icons | Lucide React |

## 3. Frontend folder structure

```text
frontend/src/
├── app/
│   ├── App.tsx
│   ├── router.tsx
│   └── providers.tsx
├── pages/
│   ├── ChatPage.tsx
│   ├── DocumentsPage.tsx
│   ├── IngestionPage.tsx
│   ├── EvaluationPage.tsx
│   ├── TracePage.tsx
│   └── SettingsPage.tsx
├── features/
│   ├── chat/
│   ├── documents/
│   ├── ingestion/
│   ├── evaluation/
│   ├── traces/
│   └── settings/
├── components/
│   ├── layout/
│   ├── ui/
│   ├── charts/
│   └── shared/
├── hooks/
├── lib/
│   ├── apiClient.ts
│   ├── sseClient.ts
│   ├── config.ts
│   └── formatters.ts
└── types/
```

## 4. Main pages

### Chat page

The chat page includes:

- question input,
- answer card,
- citation cards,
- source document cards,
- trace timeline,
- scores panel,
- conflict warnings,
- feedback buttons.

### Documents page

The documents page includes:

- indexed document list,
- file status,
- file path,
- created/modified/effective dates,
- version,
- chunk count,
- index status,
- reindex action,
- delete action.

### Ingestion page

The ingestion page includes:

- folder path config,
- sync button,
- job status table,
- failed files,
- last sync time,
- total indexed chunks.

### Evaluation page

The evaluation page includes:

- test question dataset,
- expected answer/source,
- actual answer,
- retrieval score,
- citation score,
- accuracy score,
- pass/fail result.

### Settings page

The settings page includes:

- current model provider,
- embedding provider,
- vector DB provider,
- top-k retrieval,
- reranking toggle,
- freshness rules,
- API health status.

## 5. Trace timeline design

Trace events should be shown like this:

```text
✓ Question received
✓ Query rewritten: "latest maternity leave policy"
✓ Query embedding generated
✓ Vector DB searched: 28 candidate chunks
✓ Top 8 chunks reranked
✓ Freshness resolver selected leave_policy_v4.pdf
⚠ Older conflicting source found: leave_policy_v2.pdf
✓ Answer generated
✓ Citations verified
✓ Confidence score: 87%
```

## 6. Score panel design

Recommended score panel:

| Score | UI meaning |
|---|---|
| Retrieval relevance | How relevant retrieved chunks are |
| Answer confidence | How confident the system is in the answer |
| Citation coverage | Whether claims have supporting citations |
| Freshness confidence | Whether latest documents were selected |
| Conflict risk | Whether multiple documents disagree |

## 7. Frontend API client pattern

Create one typed API layer:

```ts
export async function askQuestion(payload: AskQuestionRequest): Promise<AskQuestionResponse> {
  return api.post('/api/v1/chat/ask', payload)
}

export function streamTrace(traceId: string, onEvent: (event: TraceEvent) => void) {
  const source = new EventSource(`${API_BASE_URL}/api/v1/traces/${traceId}/stream`)
  source.onmessage = (event) => onEvent(JSON.parse(event.data))
  return () => source.close()
}
```

## 8. Frontend scalability

- Keep chat UI independent from backend provider details.
- Keep trace event types stable.
- Use optimistic loading states.
- Use pagination for document lists.
- Avoid rendering huge chunk content directly in tables.
- Use detail drawers for source/chunk inspection.

## 9. UI intelligence features

To make the UI feel advanced:

- show retrieved source cards,
- show why a document was selected,
- show older conflicting documents,
- show confidence breakdown,
- show exact trace events,
- allow user feedback: helpful/not helpful,
- show source freshness badges: Latest, Older, Conflict, Unknown Date.

## 10. Frontend MVP build order

1. App shell and layout.
2. Chat page.
3. Trace timeline component.
4. Citation/source cards.
5. Document listing page.
6. Ingestion job page.
7. Evaluation dashboard.
8. Settings page.
9. Polish and responsive layout.
