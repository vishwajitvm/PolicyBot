import type { IngestionJob } from "../../api/ingestion.api";
import { Progress } from "../../components/ui/Progress";

export function IngestionJobStatus({ job }: { job: IngestionJob }) {
  const progress = job.total_documents ? (job.processed_documents / job.total_documents) * 100 : 0;
  return (
    <div className="rounded-md border border-border bg-surface p-3">
      <div className="mb-2 flex items-center justify-between"><strong>{job.job_id}</strong><span className="text-sm text-muted">{job.status}</span></div>
      <Progress value={progress} />
      <p className="mt-2 text-sm text-muted">{job.processed_documents} processed, {job.skipped_documents} skipped</p>
    </div>
  );
}
