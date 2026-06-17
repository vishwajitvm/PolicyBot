export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  error?: { code: string; message: string; details?: unknown };
};

export type RuntimeConfig = {
  llm_provider: string;
  chat_model: string;
  embedding_provider: string;
  embedding_model: string;
  vector_db_provider: string;
  chunk_size: number;
  chunk_overlap: number;
  top_k: number;
  rerank_top_k: number;
};
