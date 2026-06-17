import { Card } from "../../components/ui/Card";

export function GoldenDatasetTable({ datasets }: { datasets: Array<Record<string, unknown>> }) {
  return <Card><h3 className="mb-3 font-semibold">Golden Datasets</h3><pre className="text-sm text-muted">{JSON.stringify(datasets, null, 2)}</pre></Card>;
}
