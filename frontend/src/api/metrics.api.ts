import { apiClient } from "./client";

export type LlmMetric = {
  provider: string;
  model: string;
  endpoint_type: string;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  error_rate: number;
  total_tokens: number;
  avg_latency_ms: number;
};

export type MetricsResponse = {
  metrics: LlmMetric[];
};

export const getMetrics = () => apiClient<MetricsResponse>("/metrics");
