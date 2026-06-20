import { apiClient } from "./client";

export type DashboardStats = {
  documents_indexed: number;
  chunks_indexed: number;
  sources_connected: number;
  running_jobs: number;
  average_confidence: number;
  latest_query_latency: number;
  active_llm_provider: string;
  active_vector_db: string;
};

export const getDashboardStats = () => apiClient<DashboardStats>("/dashboard/stats");