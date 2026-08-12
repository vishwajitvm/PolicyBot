import { Database, FileText, Gauge, GitBranch, Activity, Server, Timer, UploadCloud, ShieldCheck } from "lucide-react";
import { Card } from "../../components/ui/Card";

interface DashboardCardsProps {
  stats?: {
    documents_indexed: number;
    chunks_indexed: number;
    sources_connected: number;
    running_jobs: number;
    average_confidence: number;
    latest_query_latency: number;
    chunk_size?: number;
  };
  health?: {
    status: string;
    mongodb: { status: string };
    vector_store: { status: string };
  };
}

export function DashboardCards({ stats, health }: DashboardCardsProps) {
  const cards = [
    ["Documents Indexed", stats?.documents_indexed?.toString() ?? "0", FileText],
    ["Chunks Indexed", stats?.chunks_indexed?.toString() ?? "0", GitBranch],
    ["Sources Connected", stats?.sources_connected?.toString() ?? "0", Database],
    ["Running Jobs", stats?.running_jobs?.toString() ?? "0", UploadCloud],
    ["Average Confidence", `${stats?.average_confidence ?? 0}%`, Gauge],
    ["Latest Query Latency", `${stats?.latest_query_latency ?? 0} ms`, Timer],
    ["Chunk Size", stats?.chunk_size?.toString() ?? "1000", FileText],
    ["Backend API Health", health?.status === "ok" ? "Operational" : "Offline", Activity],
    ["MongoDB Store Health", health?.mongodb?.status === "ok" ? "Operational" : "Offline", Server],
    ["Vector DB Health", health?.vector_store?.status === "ok" ? "Operational" : "Offline", ShieldCheck],
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map(([label, value, Icon]) => {
        const isHealth = (label as string).includes("Health");
        const isOperational = value === "Operational";
        return (
          <Card key={label as string} className={isHealth ? (isOperational ? "border-green-500/20" : "border-red-500/20") : ""}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">{label as string}</span>
              <Icon size={18} className={isHealth ? (isOperational ? "text-green-400" : "text-red-400") : "text-primary"} />
            </div>
            <div className={`mt-3 text-2xl font-bold ${isHealth ? (isOperational ? "text-green-400" : "text-red-400") : ""}`}>
              {value as string}
            </div>
          </Card>
        );
      })}
    </div>
  );
}