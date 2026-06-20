import type { IngestionJob } from "../../api/ingestion.api";
import { Badge } from "../../components/ui/Badge";
import { Progress } from "../../components/ui/Progress";

export function IngestionJobStatus({ job }: { job: IngestionJob }) {
  const progress = job.progress_percent ?? 0;
  return (
    <div className="rounded-md border border-border bg-surface p-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <strong>{job.job_id.slice(0, 8)}...</strong>
          <span className="ml-2 text-xs text-muted">#{job.job_id.slice(0, 8)}</span>
        </div>
        <Badge variant={job.status === "running" ? "primary" : job.status === "completed" ? "success" : job.status === "failed" ? "destructive": "secondary"}>
          {job.status}
        </Badge>
      </div>
      <Progress value={progress} className="h-2.5" />
      <div className="mt-2 flex flex-col gap-1 text-xs">
        <div className="flex items-center gap-3">
          <span className="whitespace-nowrap">Progress:</span>
          <span className="font-mono">{progress.toFixed(1)}%</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="whitespace-nowrap">Phase:</span>
          <span className="text-muted">{job.phase.replace("_", " ")}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="whitespace-nowrap">Docs:</span>
          <span className="font-mono">{job.processed_documents}/{job.total_documents}</span>
          {job.skipped_documents > 0 && (
            <span className="ml-1 text-muted">({job.skipped_documents} skipped)</span>
          )}
        </div>
      </div>
    </div>
  );
}
