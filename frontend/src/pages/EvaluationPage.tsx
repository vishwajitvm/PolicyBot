import { PageShell } from "../components/layout/PageShell";
import { EvaluationPageFeature } from "../features/evaluation/EvaluationPage";

export function EvaluationPage() {
  return <PageShell title="Evaluation"><EvaluationPageFeature /></PageShell>;
}
