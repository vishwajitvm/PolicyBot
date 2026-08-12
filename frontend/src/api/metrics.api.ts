import { apiClient } from "./client";

export type LlmMetric = {
  provider: string;
  model: string;
  endpoint_type: string;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  error_rate: number;
  success_rate: number;
  total_tokens: number;
  avg_latency_ms: number;
};

export type TokenTimeseriesData = {
  date: string;
  total_requests: number;
  total_tokens: number;
  success_rate: number;
  error_rate: number;
};

export type MetricsResponse = {
  metrics: LlmMetric[];
  timeseries?: TokenTimeseriesData[];
};

export const getMetrics = (days_filter?: number) => {
  const query = days_filter !== undefined ? `?days_filter=${days_filter}` : "";
  return apiClient<MetricsResponse>(`/metrics${query}`);
};
