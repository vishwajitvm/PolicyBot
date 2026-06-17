import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getTrace } from "../../api/traces.api";
import { FreshnessDecisionCard } from "../../components/rag/FreshnessDecisionCard";
import { RetrievedChunkCard } from "../../components/rag/RetrievedChunkCard";
import { ScoreBreakdown } from "../../components/rag/ScoreBreakdown";
import { TraceTimeline } from "../../components/rag/TraceTimeline";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { useAppStore } from "../../stores/appStore";

export function TraceDetailsPageFeature() {
  const params = useParams();
  const lastTraceId = useAppStore((state) => state.lastTraceId);
  const traceId = params.traceId === "latest" ? lastTraceId : params.traceId;
  const { data, error } = useQuery({ queryKey: ["trace", traceId], queryFn: () => getTrace(traceId!), enabled: Boolean(traceId), retry: false });
  if (!traceId) return <EmptyState title="No trace selected" body="Run a query first, then open the trace." />;
  if (error) return <Card className="border-red-500 text-red-200">{error.message}</Card>;
  if (!data) return <Card>Loading trace...</Card>;
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
      <div className="space-y-4">
        <Card><h3 className="mb-3 font-semibold">Operational Trace</h3><TraceTimeline events={data.events} /></Card>
        <div className="grid gap-4 lg:grid-cols-2">{data.retrieved_chunks?.map((chunk, index) => <RetrievedChunkCard key={index} chunk={chunk} />)}</div>
      </div>
      <div className="space-y-4">
        <FreshnessDecisionCard decision={data.freshness_decision ?? {}} />
        <ScoreBreakdown scores={data.scores ?? {}} />
      </div>
    </div>
  );
}
