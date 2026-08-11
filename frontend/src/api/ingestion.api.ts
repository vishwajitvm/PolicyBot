import { apiClient } from "./client";

export type IngestionJob = {
  job_id: string;
  source_id: string;
  source_name?: string;
  status: string; // queued, running, completed, failed, cancelled
  phase: string; // discovering, loading_documents, parsing_documents, chunking, embedding, indexing, completed
  progress_percent: number;
  started_at?: string; // ISO string
  finished_at?: string; // ISO string
  elapsed_seconds?: number;
  estimated_remaining_seconds?: number;
  total_documents: number;
  processed_documents: number;
  skipped_documents: number;
  total_chunks: number;
  embedded_chunks: number;
  indexed_chunks: number;
  documents_per_minute: number;
  chunks_per_minute: number;
  current_document?: string; // Currently processing file
  errors: string[];
  logs: string[];
  error?: string; // failure reason
  created_at: string; // ISO string
  updated_at: string; // ISO string
};

export const startIngestion = (source_id: string) =>
  apiClient<IngestionJob>("/ingestion/jobs", { method: "POST", body: JSON.stringify({ source_id }) });
export const listIngestionJobs = () => apiClient<IngestionJob[]>("/ingestion/jobs");
export const getIngestionJob = (jobId: string) => apiClient<IngestionJob>(`/ingestion/jobs/${jobId}`);
export const cancelJob = (jobId: string) => apiClient<{signaled: boolean}>(`/ingestion/jobs/${jobId}/cancel`, { method: "POST" });
