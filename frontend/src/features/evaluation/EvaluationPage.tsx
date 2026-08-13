import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createDataset, updateDataset, deleteDataset, listDatasets, listRuns, runEvaluation } from "../../api/evaluation.api";
import { Button } from "../../components/ui/Button";
import { GoldenDatasetTable } from "./GoldenDatasetTable";
import { EvalRunDetails } from "./EvalRunDetails";
import { Play, Plus, Activity, BarChart3, Database } from "lucide-react";
import { CreateDatasetModal } from "./CreateDatasetModal";
import Swal from "sweetalert2";

export function EvaluationPageFeature() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDataset, setEditingDataset] = useState<any>(null);
  const [activeDatasetId, setActiveDatasetId] = useState<string | null>(null);
  
  const { data: datasets = [], isLoading: isLoadingDatasets } = useQuery({ queryKey: ["datasets"], queryFn: listDatasets, retry: false });
  const { data: runs = [], isLoading: isLoadingRuns } = useQuery({ queryKey: ["eval-runs"], queryFn: listRuns, retry: false });
  
  // Stats
  const totalDatasets = datasets.length;
  const totalRuns = runs.length;
  const avgAccuracy = useMemo(() => {
    if (!runs.length) return 0;
    const total = runs.reduce((acc, run: any) => acc + (run.accuracy ?? 0), 0);
    return total / runs.length;
  }, [runs]);

  const handleSuccess = (msg: string) => {
    Swal.fire({ title: "Success", text: msg, icon: "success", timer: 2000, showConfirmButton: false });
    queryClient.invalidateQueries({ queryKey: ["datasets"] });
    setIsCreateModalOpen(false);
    setEditingDataset(null);
  };

  const handleError = (err: any) => {
    Swal.fire({ title: "Error", text: err.message || "An error occurred", icon: "error" });
  };

  const create = useMutation({ 
    mutationFn: (data: { name: string, items: any[] }) => createDataset(data.name, data.items), 
    onSuccess: () => handleSuccess("Dataset created successfully!"),
    onError: handleError
  });

  const update = useMutation({
    mutationFn: (data: { dataset_id: string, name: string, items: any[] }) => updateDataset(data.dataset_id, data.name, data.items),
    onSuccess: () => handleSuccess("Dataset updated successfully!"),
    onError: handleError
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteDataset(id),
    onSuccess: () => {
      Swal.fire({ title: "Deleted!", text: "Dataset has been deleted.", icon: "success", timer: 2000, showConfirmButton: false });
      queryClient.invalidateQueries({ queryKey: ["datasets"] });
      queryClient.invalidateQueries({ queryKey: ["eval-runs"] });
    },
    onError: handleError
  });
  
  const runSingle = useMutation({ 
    mutationFn: (datasetId: string) => runEvaluation(datasetId), 
    onSuccess: (_, variables) => {
      Swal.fire({ title: "Evaluation Complete", text: "Results are now available.", icon: "success", timer: 2000, showConfirmButton: false });
      queryClient.invalidateQueries({ queryKey: ["eval-runs"] });
      setActiveDatasetId(variables);
    },
    onError: handleError
  });

  const runAll = useMutation({
    mutationFn: async () => {
      if (!datasets.length) throw new Error("No datasets available");
      const promises = datasets.map(ds => runEvaluation(String(ds.dataset_id)));
      await Promise.all(promises);
    },
    onSuccess: () => {
      Swal.fire({ title: "Master Evaluation Complete", text: "All datasets have been evaluated.", icon: "success", timer: 3000, showConfirmButton: false });
      queryClient.invalidateQueries({ queryKey: ["eval-runs"] });
    },
    onError: handleError
  });

  const handleModalSubmit = (data: { name: string, items: any[], dataset_id?: string }) => {
    if (data.dataset_id) {
      update.mutate({ dataset_id: data.dataset_id, name: data.name, items: data.items });
    } else {
      create.mutate({ name: data.name, items: data.items });
    }
  };

  const hasRuns = (datasetId: string) => runs.some((r: any) => r.dataset_id === datasetId);

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto">
      <div className="shrink-0 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-900/20 via-indigo-900/10 to-transparent border border-white/5">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
              <Activity className="w-6 h-6 text-blue-400" />
              AI Evaluation Engine
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Automatically test and grade your AI against verified Golden Datasets. Ensure accuracy stays high as your knowledge base scales and models change.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              className="flex items-center gap-2 border-white/10 hover:bg-white/5"
              onClick={() => { setEditingDataset(null); setIsCreateModalOpen(true); }}
              disabled={create.isPending || update.isPending}
            >
              <Plus className="w-4 h-4" />
              Create Dataset
            </Button>
            <Button 
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white"
              onClick={() => runAll.mutate()} 
              disabled={!datasets.length || runAll.isPending}
            >
              <Play className="w-4 h-4" />
              {runAll.isPending ? "Running All..." : "Run Master Evaluation"}
            </Button>
          </div>
        </div>

        {/* Stats Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-black/20 border border-white/5 p-4 rounded-xl flex items-center gap-4">
            <div className="bg-blue-500/10 p-3 rounded-lg"><Database className="w-6 h-6 text-blue-400" /></div>
            <div>
              <div className="text-sm text-slate-400 font-medium">Total Datasets</div>
              <div className="text-2xl font-bold text-white">{totalDatasets}</div>
            </div>
          </div>
          <div className="bg-black/20 border border-white/5 p-4 rounded-xl flex items-center gap-4">
            <div className="bg-emerald-500/10 p-3 rounded-lg"><Activity className="w-6 h-6 text-emerald-400" /></div>
            <div>
              <div className="text-sm text-slate-400 font-medium">Total Runs</div>
              <div className="text-2xl font-bold text-white">{totalRuns}</div>
            </div>
          </div>
          <div className="bg-black/20 border border-white/5 p-4 rounded-xl flex items-center gap-4">
            <div className="bg-indigo-500/10 p-3 rounded-lg"><BarChart3 className="w-6 h-6 text-indigo-400" /></div>
            <div>
              <div className="text-sm text-slate-400 font-medium">Avg Accuracy</div>
              <div className="text-2xl font-bold text-white">{avgAccuracy.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6 pb-6">
        <GoldenDatasetTable 
          datasets={datasets} 
          isLoading={isLoadingDatasets || remove.isPending} 
          onEdit={(dataset) => { setEditingDataset(dataset); setIsCreateModalOpen(true); }}
          onDelete={(id) => remove.mutate(id)}
          onRun={(id) => runSingle.mutate(id)}
          onViewResults={(id) => setActiveDatasetId(id)}
          hasRuns={hasRuns}
        />
        <EvalRunDetails 
          runs={activeDatasetId ? runs.filter((r: any) => r.dataset_id === activeDatasetId) : []} 
          isLoading={isLoadingRuns || runSingle.isPending || runAll.isPending} 
          activeDatasetId={activeDatasetId}
        />
      </div>

      <CreateDatasetModal 
        open={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleModalSubmit}
        isPending={create.isPending || update.isPending}
        initialData={editingDataset}
      />
    </div>
  );
}
