import { PageShell } from "../components/layout/PageShell";
import { TraceList } from "../features/trace/TraceList";

export function TraceListPage() {
  return (
    <PageShell title="Traces">
      <TraceList />
    </PageShell>
  );
}
