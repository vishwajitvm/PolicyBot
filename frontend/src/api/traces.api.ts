import type { TraceDetails } from "../types/trace.types";
import { apiClient } from "./client";

export const getTrace = (traceId: string) => apiClient<TraceDetails>(`/traces/${traceId}`);
export const listTraces = () => apiClient<TraceDetails[]>(`/traces`);
