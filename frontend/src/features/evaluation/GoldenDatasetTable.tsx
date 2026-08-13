import { useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Database, FileText, ChevronDown, ChevronUp, MessageSquare, Pencil, Trash2, Play, BarChart2, Clock } from "lucide-react";
import Swal from "sweetalert2";
import { formatDistanceToNow } from "date-fns";

interface GoldenDatasetTableProps {
  datasets: Array<any>;
  isLoading?: boolean;
  onEdit: (dataset: any) => void;
  onDelete: (datasetId: string) => void;
  onRun: (datasetId: string) => void;
  onViewResults: (datasetId: string) => void;
  hasRuns: (datasetId: string) => boolean;
}

export function GoldenDatasetTable({ datasets, isLoading, onEdit, onDelete, onRun, onViewResults, hasRuns }: GoldenDatasetTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleDelete = (e: React.MouseEvent, dataset: any) => {
    e.stopPropagation();
    Swal.fire({
      title: "Delete Dataset?",
      text: `Are you sure you want to delete "${dataset.name}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#3b82f6",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        onDelete(dataset.dataset_id);
      }
    });
  };

  return (
    <Card className="flex flex-col h-full bg-slate-900/50 border-white/5 p-6 rounded-2xl">
      <div className="flex items-center gap-2 mb-6">
        <Database className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-semibold text-white">Golden Datasets</h3>
      </div>
      
      <div className="flex-1 flex flex-col gap-3 max-h-[800px] overflow-y-auto custom-scrollbar pr-2">
        {isLoading ? (
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-slate-700 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-700 rounded"></div>
              </div>
            </div>
          </div>
        ) : datasets.length === 0 ? (
          <div className="text-sm text-slate-500 italic text-center py-10 bg-black/20 rounded-xl border border-white/5">
            No datasets created yet. Click "Create Dataset" to begin.
          </div>
        ) : (
          datasets.map((ds: any, idx: number) => {
            const isExpanded = expandedId === ds.dataset_id;
            const datasetHasRuns = hasRuns(ds.dataset_id);
            const timeAgo = ds.created_at ? formatDistanceToNow(new Date(ds.created_at), { addSuffix: true }) : null;
            
            return (
              <div key={ds.dataset_id || idx} className="flex flex-col rounded-xl bg-black/20 border border-white/5 transition-colors group overflow-hidden">
                {/* Summary Header (Clickable) */}
                <div 
                  className="flex flex-col gap-3 p-4 cursor-pointer hover:bg-black/40 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : ds.dataset_id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      <div>
                        <h4 className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors flex items-center gap-2">
                          {ds.name}
                        </h4>
                        <div className="text-[11px] font-mono text-slate-500 mt-1 flex items-center gap-2">
                          <span className="bg-black/40 px-1.5 py-0.5 rounded border border-white/5">ID: {ds.dataset_id?.split('-')[0]}...</span>
                          {timeAgo && (
                            <span className="flex items-center gap-1 text-slate-400">
                              <Clock className="w-3 h-3" />
                              {timeAgo}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1.5 rounded-lg text-xs font-medium">
                        <FileText className="w-3.5 h-3.5" />
                        {Array.isArray(ds.items) ? ds.items.length : 0} Items
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onEdit(ds); }}
                          className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-md transition-colors"
                          title="Edit Dataset"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => handleDelete(e, ds)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-md transition-colors"
                          title="Delete Dataset"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Run / View Results Buttons */}
                  <div className="flex items-center gap-2 mt-2 pt-3 border-t border-white/5">
                    <Button 
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-500 text-white flex-1 text-xs h-8"
                      onClick={(e) => { e.stopPropagation(); onRun(ds.dataset_id); }}
                    >
                      <Play className="w-3.5 h-3.5 mr-1.5" />
                      Run Evaluation
                    </Button>
                    
                    {datasetHasRuns && (
                      <Button 
                        size="sm"
                        variant="outline"
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 flex-1 text-xs h-8 border-slate-700"
                        onClick={(e) => { e.stopPropagation(); onViewResults(ds.dataset_id); }}
                      >
                        <BarChart2 className="w-3.5 h-3.5 mr-1.5" />
                        View Results
                      </Button>
                    )}
                  </div>
                </div>

                {/* Expanded Items Body */}
                {isExpanded && (
                  <div className="flex flex-col gap-2 p-4 bg-black/40 border-t border-white/5 max-h-96 overflow-y-auto custom-scrollbar">
                    {!ds.items || ds.items.length === 0 ? (
                      <div className="text-xs text-slate-500 text-center py-6 bg-slate-900/40 rounded-lg border border-white/5 border-dashed">
                        This dataset is empty. Edit it to add question and expected answer pairs.
                      </div>
                    ) : (
                      ds.items.map((item: any, iIdx: number) => (
                        <div key={iIdx} className="flex flex-col gap-2 p-3 bg-slate-900/60 rounded-lg border border-white/5 text-xs text-slate-300">
                          <div className="flex items-start gap-2">
                            <MessageSquare className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                            <div className="break-words font-medium text-slate-200">
                              {typeof item === 'string' ? item : item.question || JSON.stringify(item)}
                            </div>
                          </div>
                          {typeof item === 'object' && item.expected_answer && (
                            <div className="ml-5 pl-2 border-l border-white/10 text-slate-400 italic">
                              {item.expected_answer}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}

