import type { ApiResponse } from "../types/api.types";
import { apiClient } from "./client";
import type {
  ChatSessionCreate,
  ChatSessionOut,
  ChatSessionUpdate,
  ChatSessionWithMessages,
  ChatMessageCreate,
  ChatMessageOut,
} from "../schemas/chat.types";

// Note: We need to create the chat schemas in the frontend as well.
// We'll create them in a separate file or reuse from the backend? We'll create frontend schemas.

// For now, we'll define the types inline or import from a shared location.
// Since we don't have a shared schema, we'll create the types in the frontend in a separate file.
// Let's create: frontend/src/schemas/chat.ts

// We'll do that later. For now, we'll use any and then create the proper types.

export const createChatSession = (data: ChatSessionCreate) =>
  apiClient<ApiResponse<ChatSessionOut>>("/chat/sessions", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getChatSessions = () =>
  apiClient<ApiResponse<ChatSessionOut[]>>("/chat/sessions");

export const getChatSession = (sessionId: string) =>
  apiClient<ApiResponse<ChatSessionWithMessages>>(`/chat/sessions/${sessionId}`);

export const updateChatSession = (sessionId: string, data: ChatSessionUpdate) =>
  apiClient<ApiResponse<ChatSessionOut>>(`/chat/sessions/${sessionId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deleteChatSession = (sessionId: string) =>
  apiClient<ApiResponse<void>>(`/chat/sessions/${sessionId}`, {
    method: "DELETE",
  });

export const sendMessage = (sessionId: string, data: ChatMessageCreate) =>
  apiClient<ApiResponse<{ user_message: ChatMessageOut; assistant_message: ChatMessageOut }>>(
    `/chat/sessions/${sessionId}/messages`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );

export const getMessageTraces = (messageId: string) =>
  apiClient<ApiResponse<any>>(`/chat/messages/${messageId}/traces`);