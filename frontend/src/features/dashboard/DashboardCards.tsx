import { Database, FileText, Gauge, GitBranch, MessageSquare, Timer, UploadCloud, Zap } from "lucide-react";
import { Card } from "../../components/ui/Card";

const cards = [
  ["Documents Indexed", "0", FileText],
  ["Chunks Indexed", "0", GitBranch],
  ["Sources Connected", "0", Database],
  ["Running Jobs", "0", UploadCloud],
  ["Average Confidence", "0%", Gauge],
  ["Latest Query Latency", "0 ms", Timer],
  ["Active LLM Provider", "Gemini", MessageSquare],
  ["Active Vector DB", "Qdrant", Zap]
];

export function DashboardCards() {
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
