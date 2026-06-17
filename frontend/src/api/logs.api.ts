import { apiClient } from "./client";

export type LogItem = {
  timestamp: string;
  level: string;
  logger: string;
  message: string;
  module?: string;
  function?: string;
  line?: number;
  exception?: string;
};

export type LogResponse = {
  items: LogItem[];
  stats: {
    size_bytes: number;
    path: string;
    count: number;
  };
};

export type LogFilters = {
  level?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
};

export function listLogs(filters: LogFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const query = params.toString();
  return apiClient<LogResponse>(`/logs${query ? `?${query}` : ""}`);
}
