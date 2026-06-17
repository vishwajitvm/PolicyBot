import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";

export function VectorStoreSettings() {
  return <Card className="space-y-3"><h3 className="font-semibold">Vector Store Settings</h3><Select><option>qdrant</option><option>pinecone</option><option>chroma</option><option>mongodb</option></Select><Input placeholder="Chunk size" type="number" /><Input placeholder="Chunk overlap" type="number" /><Input placeholder="Top-k" type="number" /></Card>;
}
