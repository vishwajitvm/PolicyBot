export type QueryScores = {
  retrieval_score: number;
  freshness_score: number;
  context_relevance_score: number;
  citation_quality_score: number;
  answer_confidence: number;
};

export type Citation = {
  document_id: string;
  file_name: string;
  file_path: string;
  chunk_id: string;
  page_number?: number;
  score: number;
  snippet: string;
};

export type QueryResponse = {
  answer: string;
  citations: Citation[];
  scores: QueryScores;
  trace_id: string;
  session_id: string;
  model: string;
  embedding_model: string;
  vector_db: string;
  latency_ms: number;
};
