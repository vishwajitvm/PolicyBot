import type { EvaluationRun } from "../../types/evaluation.types";
import { Card } from "../../components/ui/Card";

export function EvalRunDetails({ runs }: { runs: EvaluationRun[] }) {
  return <Card><h3 className="mb-3 font-semibold">Evaluation Runs</h3><pre className="text-sm text-muted">{JSON.stringify(runs, null, 2)}</pre></Card>;
}
