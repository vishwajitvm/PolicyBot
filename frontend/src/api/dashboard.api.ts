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
  average_confidence: number;
  accuracy_trend: AccuracyTrend[];
  latest_query_latency: number;
  active_llm_provider: string;
  active_vector_db: string;
  chunk_size: number;
  llm_provider: string;
  embedding_provider: string;
  vector_db_provider: string;
};

export const getDashboardStats = () => apiClient<DashboardStats>("/dashboard/stats");