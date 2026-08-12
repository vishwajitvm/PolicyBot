import type { ApiResponse } from "../types/api.types";

export interface WorkflowConfig {
  llm_fallback_providers: string[];
  embedding_fallback_providers: string[];
}

export const getWorkflowConfig = async (): Promise<ApiResponse<WorkflowConfig>> => {
  const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
  const response = await fetch(`${url}/workflow/config`);
  if (!response.ok) {
    throw new Error("Failed to fetch workflow config");
  }
  return response.json();
};

export const updateWorkflowConfig = async (config: WorkflowConfig): Promise<ApiResponse<null>> => {
  const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
  const response = await fetch(`${url}/workflow/config`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
  if (!response.ok) {
    throw new Error("Failed to update workflow config");
  }
  return response.json();
};
