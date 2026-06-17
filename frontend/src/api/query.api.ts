import type { QueryResponse } from "../types/query.types";
import { apiClient } from "./client";

export const askQuestion = (question: string, session_id?: string) =>
  apiClient<QueryResponse>("/query", { method: "POST", body: JSON.stringify({ question, session_id }) });
