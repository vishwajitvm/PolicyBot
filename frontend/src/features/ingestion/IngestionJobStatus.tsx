import type { IngestionJob } from "../../api/ingestion.api";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "../../components/ui/Badge";
import { Progress } from "../../components/ui/Progress";
import { FileText, Box, Database, Clock, Zap, AlertTriangle, CheckCircle } from "lucide-react";

export function IngestionJobStatus({ job, onClick }: { job: IngestionJob; onClick?: () => void }) {
  const progress = job.progress_percent ?? 0;
  
  const formatTime = (seconds: number | undefined | null) => {
    if (!seconds && seconds !== 0) return "0s";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0 ? `${h}h ${m}m ${s}s` : m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const isFailed = job.status === "failed";
  const hasErrors = (job.errors && job.errors.length > 0) || job.error || job.skipped_documents > 0;
  const isPartialSuccess = job.status === "completed" && hasErrors;
  const isTotalSuccess = job.status === "completed" && !hasErrors;

  return (
    <div
      className={`relative group overflow-hidden flex flex-col gap-4 p-4 rounded-xl border border-white/5 bg-slate-900/40 backdrop-blur-sm cursor-pointer hover:bg-slate-800/60 hover:border-white/10 hover:shadow-lg transition-all duration-300 ${onClick ? "" : ""}`}
      onClick={onClick}
    >
      {/* Decorative gradient blur */}
      <div className={`absolute -inset-x-20 top-0 h-px bg-gradient-to-r from-transparent ${isFailed ? 'via-rose-500/20' : isPartialSuccess ? 'via-amber-500/20' : isTotalSuccess ? 'via-emerald-500/20' : 'via-blue-500/20'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

      {/* Top Row: Status, Full Job ID, and Time Ago */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge 
            variant={job.status === "running" || job.status === "pending" ? "primary" : isTotalSuccess ? "success" : isPartialSuccess ? "warning" : isFailed ? "destructive" : "secondary"}
            className={isFailed ? 'border-rose-500 text-rose-400 bg-rose-500/10' : ''}
          >
            {isPartialSuccess ? "partial success" : job.status}
          </Badge>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium text-sm">Job ID</span>
            <strong className="font-mono text-xs text-slate-300 bg-black/30 px-2 py-1 rounded select-all border border-white/5">
              {job.job_id}
            </strong>
          </div>
        </div>
        <span className="text-xs text-slate-400 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 opacity-70" />
          {formatDistanceToNow(new Date(job.updated_at), { addSuffix: true })}
        </span>
      </div>
      
      {/* Middle Row: Progress Bar (Only when running or pending) */}
      {(job.status === "running" || job.status === "pending") && (
        <div className="flex items-center gap-4 text-xs bg-black/20 p-2.5 rounded-lg border border-white/5">
          <span className="text-blue-300 capitalize w-24 truncate font-medium flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 animate-pulse" />
            {job.phase.replace(/_/g, " ")}
          </span>
          <Progress value={progress} className="flex-1 h-1.5 bg-slate-800" />
          <span className="font-mono w-10 text-right text-blue-200">{progress.toFixed(1)}%</span>
        </div>
      )}
      
      {/* Bottom Row: Detailed Metrics Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2 text-xs">
        <div className="flex items-center justify-between bg-black/20 border border-white/5 px-3 py-2 rounded-lg text-slate-300 hover:bg-black/40 transition-colors">
          <div className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-slate-500" /> <span>Docs</span></div>
          <div className="font-mono text-white text-right">
            {job.processed_documents || 0}<span className="text-slate-500">/{job.total_documents || 0}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between bg-black/20 border border-white/5 px-3 py-2 rounded-lg text-slate-300 hover:bg-black/40 transition-colors">
          <div className="flex items-center gap-1.5"><Box className="w-3.5 h-3.5 text-slate-500" /> <span>Chunks</span></div>
          <span className="font-mono text-white">{job.total_chunks || 0}</span>
        </div>
        
        <div className="flex items-center justify-between bg-black/20 border border-white/5 px-3 py-2 rounded-lg text-slate-300 hover:bg-black/40 transition-colors">
          <div className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-emerald-500/70" /> <span>Indexed</span></div>
          <span className={`font-mono ${(job.indexed_chunks || 0) > 0 ? 'text-emerald-400' : 'text-white'}`}>{job.indexed_chunks || 0}</span>
        </div>
        
        <div className="flex items-center justify-between bg-black/20 border border-white/5 px-3 py-2 rounded-lg text-slate-300 hover:bg-black/40 transition-colors">
          <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-500" /> <span>Time</span></div>
          <span className="font-mono text-white">{formatTime(job.elapsed_seconds)}</span>
        </div>
        
        <div className="flex items-center justify-between bg-black/20 border border-white/5 px-3 py-2 rounded-lg text-slate-300 hover:bg-black/40 transition-colors">
          <div className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-yellow-500/70" /> <span>Speed</span></div>
          <span className="font-mono text-white">
            {(job.chunks_per_minute || 0).toFixed(1)}<span className="text-slate-500 ml-1 font-sans">chunks/min</span>
          </span>
        </div>
        
        {isFailed ? (
          <div className="flex items-center justify-between px-3 py-2 rounded-lg transition-colors bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Errors</span>
            </div>
            <span className="font-mono font-semibold">{job.errors?.length || 1}</span>
          </div>
        ) : isPartialSuccess ? (
          <div className="flex items-center justify-between px-3 py-2 rounded-lg transition-colors bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Issues</span>
            </div>
            <span className="font-mono font-semibold">{job.errors?.length || job.skipped_documents || 1}</span>
          </div>
        ) : isTotalSuccess ? (
          <div className="flex items-center justify-between px-3 py-2 rounded-lg transition-colors bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span>Status</span>
            </div>
            <span className="font-mono font-semibold">OK</span>
          </div>
        ) : (
          <div className="flex items-center justify-between px-3 py-2 rounded-lg transition-colors bg-black/20 border border-white/5 text-slate-500 hover:bg-black/40">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-slate-600" />
              <span>Errors</span>
            </div>
            <span className="font-mono font-semibold">0</span>
          </div>
        )}
      </div>
    </div>
  );
}