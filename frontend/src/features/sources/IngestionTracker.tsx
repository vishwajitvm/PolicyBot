import { useEffect, useState, useRef } from "react";
import { Activity, CheckCircle2, Clock, FileText, Loader2, PlayCircle, XCircle } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

interface IngestionJob {
  job_id: string;
  source_id: string;
  source_name: string | null;
  status: "queued" | "running" | "completed" | "failed" | "cancelled";
  phase: string;
  progress_percent: number;
  total_documents: number;
  processed_documents: number;
  skipped_documents: number;
  total_chunks: number;
  embedded_chunks: number;
  indexed_chunks: number;
  documents_per_minute: number;
  chunks_per_minute: number;
  current_document: string | null;
  estimated_remaining_seconds: number | null;
  logs: string[];
  errors: string[];
}

export function IngestionTracker({ jobId, onClose }: { jobId: string; onClose: () => void }) {
  const [job, setJob] = useState<IngestionJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    let ws: WebSocket;
    
    // Slight delay to handle React Strict Mode double-mounts
    const timeoutId = setTimeout(() => {
      if (!isMounted) return;
      const wsUrl = `${import.meta.env.VITE_API_BASE_URL?.replace("http", "ws") ?? "ws://localhost:8000/api/v1"}/ingestion/ws/${jobId}`;
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const data = JSON.parse(event.data);
          if (data.error) {
            setError(data.error);
          } else {
            setJob(data);
          }
        } catch (err) {
          console.error("Failed to parse websocket message", err);
        }
      };

      ws.onerror = (err) => {
        if (!isMounted) return;
        console.error("WebSocket error", err);
        // Only show error UI if we haven't received initial state
        setJob((prev) => {
          if (!prev) setError("WebSocket connection failed");
          return prev;
        });
      };
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (ws) {
        ws.close();
      }
    };
  }, [jobId]);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [job?.logs?.length]);

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "Calculating...";
    if (seconds === 0) return "Done";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}m ${s}s`;
  };

  if (error) {
    return (
      <Card className="p-6 border-red-500/30 bg-red-500/10 text-red-400">
        <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><XCircle /> Tracking Error</h3>
        <p>{error}</p>
        <Button onClick={onClose} className="mt-4 bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/50">Close</Button>
      </Card>
    );
  }

  if (!job) {
    return (
      <Card className="p-10 flex flex-col items-center justify-center text-muted glass-card">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p>Connecting to ingestion tracker...</p>
      </Card>
    );
  }

  const isComplete = job.status === "completed" || job.status === "failed" || job.status === "cancelled";

  return (
    <Card className="p-6 glass-card border-primary/30 bg-panel/80 backdrop-blur-xl shadow-2xl animate-slide-in relative overflow-hidden">
      {/* Background glow based on status */}
      <div className={`absolute top-[-50px] right-[-50px] w-64 h-64 rounded-full blur-[100px] pointer-events-none ${
        job.status === 'completed' ? 'bg-green-500/10' : 
        job.status === 'failed' ? 'bg-red-500/10' : 
        'bg-primary/10'
      }`}></div>

      <div className="flex justify-between items-center mb-6 relative z-10">
        <div className="flex items-center gap-3">
          {job.status === 'running' ? <Loader2 className="w-6 h-6 text-primary animate-spin" /> : 
           job.status === 'completed' ? <CheckCircle2 className="w-6 h-6 text-green-400" /> :
           <Activity className="w-6 h-6 text-muted" />}
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-text to-muted">
            Ingestion Job: {job.source_name || "Source"}
          </h2>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
          job.status === 'running' ? 'bg-primary/10 text-primary border-primary/30' :
          job.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
          job.status === 'failed' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
          'bg-panel text-muted border-border'
        }`}>
          {job.status}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-8 relative z-10">
        <div className="flex justify-between text-sm mb-2 text-text font-medium">
          <span>{job.phase === 'loading_documents' ? 'Loading Documents...' : job.phase === 'embedding' ? 'Embedding Chunks...' : 'Processing...'}</span>
          <span className="text-primary">{job.progress_percent.toFixed(1)}%</span>
        </div>
        <div className="w-full h-3 bg-panel border border-border rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${job.status === 'failed' ? 'bg-red-500' : job.status === 'completed' ? 'bg-green-500' : 'bg-primary relative overflow-hidden'}`}
            style={{ width: `${job.progress_percent}%` }}
          >
            {job.status === 'running' && (
              <div className="absolute inset-0 bg-white/20 w-1/2 -skew-x-12 animate-[shimmer_1.5s_infinite]"></div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 relative z-10">
        <div className="glass-panel p-3 border-border rounded-lg flex flex-col justify-center">
          <div className="text-xs text-muted mb-1 flex items-center gap-1"><FileText className="w-3 h-3"/> Documents</div>
          <div className="font-semibold text-lg">{job.processed_documents || 0} / {job.total_documents || 0}</div>
        </div>
        <div className="glass-panel p-3 border-border rounded-lg flex flex-col justify-center">
          <div className="text-xs text-muted mb-1 flex items-center gap-1"><PlayCircle className="w-3 h-3"/> Chunks Embedded</div>
          <div className="font-semibold text-lg">{job.embedded_chunks || 0} / {job.total_chunks || 0}</div>
        </div>
        <div className="glass-panel p-3 border-border rounded-lg flex flex-col justify-center">
          <div className="text-xs text-muted mb-1 flex items-center gap-1"><Activity className="w-3 h-3"/> Speed</div>
          <div className="font-semibold text-lg">{job.chunks_per_minute || 0} <span className="text-xs text-muted font-normal">ch/min</span></div>
        </div>
        <div className="glass-panel p-3 border-border rounded-lg flex flex-col justify-center">
          <div className="text-xs text-muted mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> ETA</div>
          <div className="font-semibold text-lg text-primary">{formatTime(job.estimated_remaining_seconds)}</div>
        </div>
      </div>

      {job.current_document && job.status === 'running' && (
        <div className="mb-6 bg-primary/5 border border-primary/20 p-3 rounded-lg flex items-center gap-3 relative z-10">
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
          <span className="text-sm font-medium text-text truncate">Processing: <span className="text-primary">{job.current_document}</span></span>
        </div>
      )}

      {/* Terminal Logs */}
      <div className="bg-[#0f111a] border border-border rounded-lg p-4 font-mono text-xs text-gray-300 h-48 overflow-y-auto mb-6 relative z-10 shadow-inner custom-scrollbar">
        {!job.logs || job.logs.length === 0 && <span className="text-gray-500 italic">Waiting for logs...</span>}
        {job.logs?.map((log, idx) => (
          <div key={idx} className="mb-1 pb-1 border-b border-white/5 last:border-0 hover:bg-white/5 px-1 rounded transition-colors break-words whitespace-pre-wrap">
            {log}
          </div>
        ))}
        {job.errors?.map((err, idx) => (
          <div key={`err-${idx}`} className="mb-1 pb-1 border-b border-red-500/10 text-red-400 break-words whitespace-pre-wrap">
            [ERROR] {err}
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>

      <div className="flex justify-end relative z-10">
        <Button 
          onClick={onClose} 
          variant={isComplete ? "primary" : "outline"}
          className={!isComplete ? "border-border hover:bg-panel text-text" : "bg-primary text-white hover:bg-primary/80"}
        >
          {isComplete ? "Done" : "Hide Tracker"}
        </Button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(250%); }
        }
      `}} />
    </Card>
  );
}
