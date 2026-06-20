import { Database, FileText, Gauge, GitBranch, MessageSquare, Timer, UploadCloud, Zap } from "lucide-react";
import { Card } from "../../components/ui/Card";

interface DashboardCardsProps {
  stats?: {
    documents_indexed: number;
    chunks_indexed: number;
    sources_connected: number;
    running_jobs: number;
    average_confidence: number;
    latest_query_latency: number;
    active_llm_provider: string;
    active_vector_db: string;
    chunk_size?: number;
    llm_provider?: string;
    embedding_provider?: string;
    vector_db_provider?: string;
  };
}

export function DashboardCards({ stats }: DashboardCardsProps) {
  // Use stats data if available, otherwise fallback to default values
  const cards = [
    ["Documents Indexed", stats?.documents_indexed?.toString() ?? "0", FileText],
    ["Chunks Indexed", stats?.chunks_indexed?.toString() ?? "0", GitBranch],
    ["Sources Connected", stats?.sources_connected?.toString() ?? "0", Database],
    ["Running Jobs", stats?.running_jobs?.toString() ?? "0", UploadCloud],
    ["Average Confidence", `${stats?.average_confidence ?? 0}%`, Gauge],
    ["Latest Query Latency", `${stats?.latest_query_latency ?? 0} ms`, Timer],
    ["Active LLM Provider", stats?.active_llm_provider ?? "Gemini", MessageSquare],
    ["Active Vector DB", stats?.active_vector_db ?? "Qdrant", Zap],
    ["Chunk Size", stats?.chunk_size?.toString() ?? "1000", FileText], // Using FileText as placeholder, maybe we can use a different icon?
    ["Embedding Provider", stats?.embedding_provider ?? "unknown", MessageSquare], // Using MessageSquare as placeholder
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(([label, value, Icon]) => (
        <Card key={label as string}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">{label as string}</span>
            <Icon size={18} className="text-primary" />
          </div>
          <div className="mt-3 text-2xl font-bold">{value as string}</div>
        </Card>
      ))}
    </div>
  );
}