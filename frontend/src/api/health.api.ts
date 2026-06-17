import { apiClient } from "./client";

export type Health = {
  app: string;
  environment: string;
  status: string;
  mongodb: { status: string; detail?: string };
  vector_store: { status: string; detail?: string };
};

export const getHealth = () => apiClient<Health>("/health");
