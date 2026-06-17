export type EvaluationRun = {
  run_id: string;
  dataset_id: string;
  accuracy: number;
  passed: number;
  failed: number;
  details: Array<Record<string, unknown>>;
};
