import type { QueryScores } from "./query.types";

export interface ChatSessionBase {
  title: string;
}

export interface ChatSessionCreate extends ChatSessionBase {}

export interface ChatSessionUpdate {
  title?: string;
}

export interface ChatSessionOut extends ChatSessionBase {
  id: string;
  created_at: string; // ISO string
  updated_at: string;
  is_deleted: boolean;
}

export interface ChatMessageBase {
  content: string;
}

export interface ChatMessageCreate extends ChatMessageBase {
  question: string; // For sending a message, we expect a question
}

export interface ChatMessageOut extends ChatMessageBase {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  created_at: string;
  trace_id?: string | null;
  model?: string | null;
  embedding_provider?: string | null;
  vector_db?: string | null;
  latency_ms?: number | null;
  scores?: QueryScores | null;
}

export interface ChatSessionWithMessages extends ChatSessionOut {
  messages: ChatMessageOut[];
}