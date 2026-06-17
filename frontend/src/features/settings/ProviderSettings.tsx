import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";

export function ProviderSettings() {
  return <Card className="space-y-3"><h3 className="font-semibold">Provider Settings</h3><Select><option>gemini</option><option>openai</option><option>anthropic</option><option>local</option></Select><Input placeholder="Chat model" /><Input placeholder="Embedding model" /></Card>;
}
