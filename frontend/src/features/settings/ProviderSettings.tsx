import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";

export function ProviderSettings() {
  return (
    <Card className="space-y-4 p-6 glass-card border-border hover:border-primary/20 transition-all bg-panel/30">
      <h3 className="font-semibold text-lg text-transparent bg-clip-text bg-gradient-to-r from-text to-muted tracking-wider uppercase">Provider Settings</h3>
      <div className="space-y-4">
        <Select className="w-full bg-panel/50 border-border">
          <option>gemini</option>
          <option>openai</option>
          <option>anthropic</option>
          <option>local</option>
        </Select>
        <Input placeholder="Chat model" className="bg-panel/50 border-border focus:border-primary" />
        <Input placeholder="Embedding model" className="bg-panel/50 border-border focus:border-primary" />
      </div>
    </Card>
  );
}
