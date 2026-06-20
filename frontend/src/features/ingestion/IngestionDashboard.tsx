import { useState, useEffect } from "react";
import type { IngestionJob } from "../../api/ingestion.api";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { Progress } from "../../components/ui/Progress";
import { AlertTriangle, Clock, Database, RefreshCw, Settings, Upload, FileText, Folder, arrowUpRight } from "lucide-react";

export function IngestionDashboard({ job }: { job: IngestionJob }) {
  const [logs, setLogs] = useState<string[]>(job.logs ?? []);

  // Sync logs whenever job changes
  useEffect(() => {
    setLogs(job.logs ?? []);
  }, [job]);

  // Format time
  const formatElapsedTime = (seconds: number | null | undefined) => {
    if (!seconds && seconds !== 0) return "0s";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const formatETA = (seconds: number | null | undefined) => {
    if (!seconds && seconds !== 0) return "calculating...";
    return formatElapsedTime(seconds);
  };

  // Determine status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "queued": return "secondary";
      case "running": return "primary";
      case "completed": return "success";
      case "failed": return "destructive";
      case "cancelled": return "default";
      default: return "secondary";
    }
  };

  // Determine phase badge variant
  const getPhaseVariant = (phase: string) => {
    switch (phase) {
      case "discovering": return "info";
      case "loading_documents": return "info";
      case "parsing_documents": return "info";
      case "chunking": return "warning";
      case "embedding": return "warning";
      case "indexing": return "warning";
      case "completed": return "success";
      case "failed": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      {/* Job Header */}
      <Card className="pb-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold">{job.source_name || "Unknown Source"}</h2>
            <p className="text-sm text-muted truncate">Job ID: {job.job_id}</p>
          </div>
          <div className="text-right">
            <Badge variant={getStatusVariant(job.status)}>{job.status}</Badge>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" /> <span>Elapsed: {formatElapsedTime(job.elapsed_seconds)}</span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> <span>ETA: {formatETA(job.estimated_remaining_seconds)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4" /> <span>Speed: {job.documents_per_minute.toFixed(1)} docs/min</span>
          </div>
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" /> <span>Chunk Speed: {job.chunks_per_minute.toFixed(1)} chunks/min</span>
          </div>
        </div>
      </Card>

      {/* Progress Section */}
      <Card>
        <h3 className="mb-4 font-semibold">Overall Progress</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Progress</span>
            <span className="font-mono text-right">{job.progress_percent.toFixed(1)}%</span>
          </div>
          {/* Custom progress bar with percentage inside */}
          <div className="relative h-4 w-full bg-muted rounded">
            <div className="bg-primary h-4 rounded" style={{ width: `${job.progress_percent}%` }}></div>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white">
              {job.progress_percent.toFixed(1)}%
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-muted">
            <span>Phase: </span>
            <span>
              <Badge variant={getPhaseVariant(job.phase)}>{job.phase.replace("_", " ")}</Badge>
            </span>
          </div>
        </div>
      </Card>

      {/* Details Section */}
      <Card>
        <h3 className="mb-4 font-semibold">Processing Details</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> <span className="font-medium">Current File:</span>
            </div>
            <p className="text-danger text-sm break-all word-wrap">{job.current_document || "Idle"}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Folder className="h-5 w-5" /> <span className="font-medium">Files Processed:</span>
            </div>
            <p className="text-right font-mono">
              {job.processed_documents} / {job.total_documents}
              {job.skipped_documents > 0 && ` (${job.skipped_documents} skipped)`}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Folder className="h-5 w-5" /> <span className="font-medium">Files Left:</span>
            </div>
            <p className="text-right font-mono">
              {Math.max(0, job.total_documents - job.processed_documents - job.skipped_documents)} / {job.total_documents}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" /> <span className="font-medium">Total Chunks:</span>
            </div>
            <p className="text-right font-mono">
              {job.indexed_chunks} / {job.total_chunks}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" /> <span className="font-medium">Embedded Chunks:</span>
            </div>
            <p className="text-right font-mono">
              {job.embedded_chunks} / {job.total_chunks}
            </p>
          </div>
        </div>
      </Card>

      {/* Error Details Panel (shown when job has errors) */}
      {(job.error || job.errors?.length > 0) && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Error Details</h3>
          </div>
          <div className="space-y-2">
            {job.error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                <h4 className="mb-2 text-destructive font-medium">Failure Reason:</h4>
                <p className="text-destructive text-sm whitespace-pre-wrap break-all">{job.error}</p>
              </div>
            )}
            {job.errors?.length > 0 && (
              <>
                <h4 className="mb-2 text-destructive font-medium">Error List:</h4>
                <div className="space-y-1">
                  {job.errors.map((err, index) => (
                    <div key={index} className="bg-destructive/5 border border-destructive/20 rounded-md p-2">
                      <p className="text-destructive text-xs whitespace-pre-wrap break-all">{err}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Card>
      )}

      {/* Live Activity Panel */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Live Activity</h3>
          <button
            onClick={() => setLogs([])}
            className="text-sm text-muted hover:text-offset-hover"
          >
            Clear
          </button>
        </div>
        <div className="max-h-96 overflow-auto">
          {logs.length > 0 ? (
            <div className="space-y-1 text-xs">
              {logs.map((log, index) => (
                <div key={index} className="flex items-start gap-2 pt-1">
                  <div className="flex-shrink-0 h-3 w-3 rounded-full bg-muted"></div>
                  <div className="whitespace-pre-wrap break-all">
                    {/* Simple log level detection */}
                    {log.toLowerCase().includes("error") ? (
                      <span className="text-destructive">{log}</span>
                    ) : log.toLowerCase().includes("warning") || log.toLowerCase().includes("warn") ? (
                      <span className="text-warning">{log}</span>
                    ) : log.toLowerCase().includes("success") || log.toLowerCase().includes("indexed") ? (
                      <span className="text-success">{log}</span>
                    ) : (
                      <span className="text-muted">{log}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-4 text-muted">No activity yet</p>
          )}
        </div>
      </Card>
    </div>
  );
}