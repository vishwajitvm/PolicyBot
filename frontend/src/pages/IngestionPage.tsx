import { PageShell } from "../components/layout/PageShell";
import { IngestionPageFeature } from "../features/ingestion/IngestionPage";

export function IngestionPage() {
  return <PageShell title="Ingestion"><IngestionPageFeature /></PageShell>;
}
