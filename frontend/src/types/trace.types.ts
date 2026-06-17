export type TraceEvent = {
  step: string;
  status: string;
  input_summary: Record<string, unknown>;
  output_summary: Record<string, unknown>;
  latency_ms: number;
  timestamp: string;
};

export type TraceDetails = {
  trace_id: string;
  question?: string;
  events: TraceEvent[];
  retrieved_chunks: Array<Record<string, unknown>>;
  freshness_decision: Record<string, unknown>;
  scores: Record<string, number>;
};
