import { apiClient } from "./client";

export type LlmModelDef = {
  id: string;
  name: string;
  type: string;
};

export type AvailableModels = Record<string, LlmModelDef[]>;

export const getModels = () => apiClient<AvailableModels>("/models");
