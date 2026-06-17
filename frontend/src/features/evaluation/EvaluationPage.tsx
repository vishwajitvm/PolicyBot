import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createDataset, listDatasets, listRuns, runEvaluation } from "../../api/evaluation.api";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EvalRunDetails } from "./EvalRunDetails";
import { GoldenDatasetTable } from "./GoldenDatasetTable";

export function EvaluationPageFeature() {
  const queryClient = useQueryClient();
  const { data: datasets = [] } = useQuery({ queryKey: ["datasets"], queryFn: listDatasets, retry: false });
  const { data: runs = [] } = useQuery({ queryKey: ["eval-runs"], queryFn: listRuns, retry: false });
  const create = useMutation({ mutationFn: () => createDataset("Starter Golden Dataset", []), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["datasets"] }) });
  const run = useMutation({ mutationFn: () => runEvaluation(String(datasets[0]?.dataset_id ?? "")), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["eval-runs"] }) });
  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap gap-3"><Button onClick={() => create.mutate()}>Create Dataset</Button><Button onClick={() => run.mutate()} disabled={!datasets.length}>Run Evaluation</Button></Card>
      <div className="grid gap-4 lg:grid-cols-2"><GoldenDatasetTable datasets={datasets} /><EvalRunDetails runs={runs} /></div>
    </div>
  );
}
