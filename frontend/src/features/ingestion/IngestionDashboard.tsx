import { useState, useEffect, useRef } from "react";
import type { IngestionJob } from "../../api/ingestion.api";
import { cancelJob } from "../../api/ingestion.api";
import { Badge } from "../../components/ui/Badge";
import { AlertTriangle, Clock, Database, RefreshCw, Settings, Upload, FileText, Folder, CheckCircle, Activity, Box, Zap } from "lucide-react";

export function IngestionDashboard({ job }: { job: IngestionJob }) {
  const [logs, setLogs] = useState<string[]>(job.logs ?? []);
  const [isCancelling, setIsCancelling] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Sync logs whenever job changes
  useEffect(() => {
    setLogs(job.logs ?? []);
  }, [job]);

  // Auto-scroll to bottom of logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

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

  const isRunning = job.status === "running";
  const isFailed = job.status === "failed";
  const isCompleted = job.status === "completed";

  return (
    <div className="relative rounded-2xl bg-slate-900/50 border border-slate-800 shadow-xl overflow-hidden">
      
      <div className="relative z-10 p-6 md:p-8 w-full min-h-[500px] flex flex-col gap-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-700/50 pb-6">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-xl flex items-center justify-center ${isRunning ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : isCompleted ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
              {isRunning ? <Activity className="w-8 h-8 animate-pulse" /> : isCompleted ? <CheckCircle className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight text-glow">{job.source_name || "Knowledge Base Sync"}</h2>
              <p className="text-sm text-slate-400 font-mono mt-1 flex items-center gap-2">
                Job ID: {job.job_id}
                {isRunning && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wider border backdrop-blur-md ${
              isRunning ? 'bg-blue-500/10 text-blue-400 border-blue-500/50' : 
              isCompleted ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50' : 
              'bg-slate-800 text-slate-300 border-slate-700'
            }`}>
              {job.status}
            </span>
          </div>
        </div>

        {/* Global Progress Section */}
        <div className="glass-panel p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" /> Pipeline Progress
            </h3>
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 text-glow-primary">
              {job.progress_percent.toFixed(1)}%
            </span>
          </div>
          
          <div className="relative h-6 w-full bg-slate-950/50 rounded-full overflow-hidden border border-slate-800/50 shadow-inner">
            <div 
              className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out flex items-center justify-end px-2 ${
                isFailed ? 'bg-rose-500' : isCompleted ? 'bg-emerald-500' : 'bg-blue-500'
              }`} 
              style={{ width: `${job.progress_percent}%` }}
            >
              {isRunning && (
                <div className="w-full h-full absolute top-0 left-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] animate-[slide_1s_linear_infinite]" />
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center text-sm font-medium text-slate-400 mt-1">
            <span className="flex items-center gap-2">Phase: <span className="text-indigo-300 uppercase tracking-wider">{job.phase.replace("_", " ")}</span></span>
            {isRunning && (
              <div className="flex items-center gap-4">
                <button 
                  onClick={async () => {
                    if (confirm("Are you sure you want to cancel this ingestion?")) {
                      setIsCancelling(true);
                      try {
                        await cancelJob(job.job_id);
                      } catch (e) {
                        console.error(e);
                      }
                      setIsCancelling(false);
                    }
                  }}
                  disabled={isCancelling}
                  className="text-xs px-3 py-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors disabled:opacity-50"
                >
                  {isCancelling ? "Cancelling..." : "Cancel Ingestion"}
                </button>
                <span className="animate-pulse flex items-center gap-2"><RefreshCw className="w-3 h-3 animate-spin" /> Processing...</span>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Metric Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 flex flex-col gap-2 group hover:bg-slate-800/40 transition-colors">
            <span className="text-slate-400 text-sm font-medium flex items-center gap-2"><Clock className="w-4 h-4 text-slate-500" /> Elapsed / ETA</span>
            <div className="flex items-end justify-between">
              <span className="text-xl font-bold text-white">{formatElapsedTime(job.elapsed_seconds)}</span>
              <span className="text-sm text-slate-500">~{formatETA(job.estimated_remaining_seconds)}</span>
            </div>
          </div>
          
          <div className="glass-panel p-5 flex flex-col gap-2 group hover:bg-slate-800/40 transition-colors">
            <span className="text-slate-400 text-sm font-medium flex items-center gap-2"><FileText className="w-4 h-4 text-slate-500" /> Documents</span>
            <div className="flex items-end justify-between">
              <span className="text-xl font-bold text-white">{job.processed_documents} <span className="text-slate-600 text-sm">/ {job.total_documents}</span></span>
              <span className="text-xs text-slate-500 px-2 py-1 bg-slate-950/50 rounded">{job.documents_per_minute.toFixed(1)} /min</span>
            </div>
          </div>
          
          <div className="glass-panel p-5 flex flex-col gap-2 group hover:bg-slate-800/40 transition-colors">
            <span className="text-slate-400 text-sm font-medium flex items-center gap-2"><Box className="w-4 h-4 text-slate-500" /> Chunks Generated</span>
            <div className="flex items-end justify-between">
              <span className="text-xl font-bold text-white">{job.total_chunks}</span>
              <span className="text-xs text-slate-500 px-2 py-1 bg-slate-950/50 rounded">{job.chunks_per_minute.toFixed(1)} /min</span>
            </div>
          </div>
          
          <div className="glass-panel p-5 flex flex-col gap-2 group hover:bg-slate-800/40 transition-colors">
            <span className="text-slate-400 text-sm font-medium flex items-center gap-2"><Database className="w-4 h-4 text-slate-500" /> Indexed (Vector DB)</span>
            <div className="flex items-end justify-between">
              <span className="text-xl font-bold text-emerald-400">{job.indexed_chunks}</span>
              <span className="text-xs text-slate-500 px-2 py-1 bg-slate-950/50 rounded">Success</span>
            </div>
          </div>
        </div>

        {/* Current Working Document Display */}
        {job.current_document && (
          <div className="glass-panel p-4 border-l-4 border-l-blue-500 flex items-center justify-between">
            <div className="flex items-center gap-4 truncate">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-blue-300 uppercase tracking-widest mb-1">Currently Processing</p>
                <p className="text-lg font-medium text-white truncate max-w-lg">{job.current_document}</p>
              </div>
            </div>
            {isRunning && (
              <div className="hidden md:flex items-center gap-2 text-sm text-blue-300/80 bg-blue-950/50 px-3 py-1 rounded-full">
                <RefreshCw className="w-3 h-3 animate-spin" /> Chunking & Embedding...
              </div>
            )}
          </div>
        )}

        {/* Timestamps Section */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-mono px-2">
          <span>
            Started: {job.started_at ? new Date(job.started_at).toLocaleString() : "Pending"}
          </span>
          <span>
            Finished: {job.finished_at ? new Date(job.finished_at).toLocaleString() : (isRunning ? "In Progress" : "--")}
          </span>
        </div>

        {/* Error Details */}
        {(job.error || job.errors?.length > 0) && (
          <div className="glass-panel border-rose-500/30 bg-rose-950/20 p-5 mt-2">
            <h3 className="font-semibold text-rose-400 mb-3 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Critical Errors Encountered</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              {job.error && (
                <div className="bg-rose-950/50 border border-rose-900 rounded p-3">
                  <p className="text-rose-300 text-sm font-mono whitespace-pre-wrap">{job.error}</p>
                </div>
              )}
              {job.errors?.map((err, index) => (
                <div key={index} className="bg-rose-950/50 border border-rose-900/50 rounded p-2">
                  <p className="text-rose-300/80 text-xs font-mono whitespace-pre-wrap">{err}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Terminal / Logs */}
        <div className="flex-1 min-h-[300px] flex flex-col bg-[#0d1117] rounded-xl border border-slate-700/50 shadow-inner overflow-hidden relative">
          <div className="flex justify-between items-center bg-slate-900/80 px-4 py-2 border-b border-slate-700/50 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
              </div>
              <span className="ml-2 text-xs font-mono text-slate-400 uppercase tracking-wider">Live Activity Stream</span>
            </div>
            <button 
              onClick={() => setLogs([])}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-widest"
            >
              Clear
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-1.5 custom-scrollbar">
            {logs.length > 0 ? (
              logs.map((log, index) => {
                const lowerLog = log.toLowerCase();
                const isError = lowerLog.includes("error") || lowerLog.includes("failed");
                const isWarn = lowerLog.includes("warning") || lowerLog.includes("warn");
                const isSuccess = lowerLog.includes("success") || lowerLog.includes("indexed") || lowerLog.includes("completed");
                const isProcessing = lowerLog.includes("processing batch") || lowerLog.includes("chunking");
                
                return (
                  <div key={index} className={`flex items-start gap-3 py-0.5 px-2 rounded transition-colors hover:bg-white/5 ${isError ? 'bg-rose-950/20' : isSuccess ? 'bg-emerald-950/10' : ''}`}>
                    <span className="text-slate-500 flex-shrink-0 select-none">❯</span>
                    <span className={`break-all ${
                      isError ? "text-rose-400" :
                      isWarn ? "text-amber-400" :
                      isSuccess ? "text-emerald-400" :
                      isProcessing ? "text-blue-300" :
                      "text-slate-300"
                    }`}>
                      {log}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-3 opacity-50">
                <Activity className="w-8 h-8 animate-pulse" />
                <p>Awaiting stream data...</p>
              </div>
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
        
      </div>
    </div>
  );
}