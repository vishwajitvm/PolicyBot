import type { RuntimeConfig } from "../types/api.types";
import { apiClient } from "./client";

export const getConfig = () => apiClient<RuntimeConfig>("/config");
export const patchConfig = (body: Partial<RuntimeConfig>) =>
  apiClient<RuntimeConfig>("/config", { method: "PATCH", body: JSON.stringify(body) });
