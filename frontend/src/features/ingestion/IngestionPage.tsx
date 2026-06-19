import { useQuery } from "@tanstack/react-query";
import { listIngestionJobs } from "../../api/ingestion.api";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { IngestionJobStatus } from "./IngestionJobStatus";
import { IngestionLogPanel } from "./IngestionLogPanel";

export function IngestionPageFeature() {
  const { data = [] } = useQuery({ queryKey: ["ingestion-jobs"], queryFn: listIngestionJobs, retry: false, refetchInterval: 5000 });
  const latest = data[0];
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
      <Card>
        <h3 className="mb-3 font-semibold">Ingestion Jobs</h3>
        {data.length ? <div className="space-y-3">{data.map((job) => <IngestionJobStatus key={job.job_id} job={job} />)}</div> : <EmptyState title="No ingestion jobs yet" />}
      </Card>
      <IngestionLogPanel logs={latest?.logs ?? []} />
    </div>
  );
}
