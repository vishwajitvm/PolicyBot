import { apiClient } from "./client";

export type AccuracyTrend = {
  timestamp: string;
  confidence: number;
  latency: number;
};

export type DashboardStats = {
  documents_indexed: number;
  chunks_indexed: number;
  sources_connected: number;
  running_jobs: number;
  total_document_versions: number;
  duplicate_documents: number;
  total_chat_sessions: number;
  unique_models_list: string[];
  average_confidence: number;
  accuracy_trend: AccuracyTrend[];
  latest_query_latency: number;
  active_llm_provider: string;
  active_vector_db: string;
  chunk_size: number;
  llm_provider: string;
  embedding_provider: string;
  vector_db_provider: string;
  timezone: string;
};

export const getDashboardStats = (days_filter?: number, model_filter?: string) => {
  const params = new URLSearchParams();
  if (days_filter !== undefined) {
    params.append('days_filter', days_filter.toString());
  }
  if (model_filter) {
    params.append('model_filter', model_filter);
  }
  
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiClient<DashboardStats>(`/dashboard/stats${query}`);
};