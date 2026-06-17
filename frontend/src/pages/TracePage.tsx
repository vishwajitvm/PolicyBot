import { PageShell } from "../components/layout/PageShell";
import { TraceDetailsPageFeature } from "../features/trace/TraceDetailsPage";

export function TracePage() {
  return <PageShell title="Trace Details"><TraceDetailsPageFeature /></PageShell>;
}
