import type { EvaluationRun } from "../types/evaluation.types";
import { apiClient } from "./client";

export const listDatasets = () => apiClient<Array<Record<string, unknown>>>("/evaluation/datasets");
export const createDataset = (name: string, items: Array<Record<string, unknown>>) =>
  apiClient<Record<string, unknown>>("/evaluation/datasets", { method: "POST", body: JSON.stringify({ name, items }) });
export const updateDataset = (dataset_id: string, name: string, items: Array<Record<string, unknown>>) =>
  apiClient<Record<string, unknown>>(`/evaluation/datasets/${dataset_id}`, { method: "PUT", body: JSON.stringify({ name, items }) });
export const deleteDataset = (dataset_id: string) =>
  apiClient<Record<string, unknown>>(`/evaluation/datasets/${dataset_id}`, { method: "DELETE" });
export const runEvaluation = (dataset_id: string) =>
  apiClient<EvaluationRun>("/evaluation/run", { method: "POST", body: JSON.stringify({ dataset_id }) });
export const listRuns = () => apiClient<EvaluationRun[]>("/evaluation/runs");
