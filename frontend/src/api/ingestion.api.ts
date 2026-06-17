import { apiClient } from "./client";

export type IngestionJob = {
  job_id: string;
  source_id: string;
  status: string;
  total_documents: number;
  processed_documents: number;
  skipped_documents: number;
  errors: string[];
  logs: string[];
};

export const startIngestion = (source_id: string) =>
  apiClient<IngestionJob>("/ingestion/jobs", { method: "POST", body: JSON.stringify({ source_id }) });
export const listIngestionJobs = () => apiClient<IngestionJob[]>("/ingestion/jobs");
export const getIngestionJob = (jobId: string) => apiClient<IngestionJob>(`/ingestion/jobs/${jobId}`);
