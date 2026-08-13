import { PageShell } from "../components/layout/PageShell";
import { ModelManagerFeature } from "../features/models/ModelManager";

export function ModelManagerPage() {
  return <PageShell title="Model Manager"><ModelManagerFeature /></PageShell>;
}
