import { useState, useEffect } from "react";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Plus, Trash2, Save, FileText } from "lucide-react";

interface CreateDatasetModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string, items: any[], dataset_id?: string }) => void;
  isPending: boolean;
  initialData?: { dataset_id: string; name: string; items: any[] } | null;
}

export function CreateDatasetModal({ open, onClose, onSubmit, isPending, initialData }: CreateDatasetModalProps) {
  const [name, setName] = useState("New Golden Dataset");
  const [items, setItems] = useState<any[]>([{ question: "", expected_answer: "" }]);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setName(initialData.name);
        setItems(initialData.items?.length ? initialData.items : [{ question: "", expected_answer: "" }]);
      } else {
        setName("New Golden Dataset");
        setItems([{ question: "", expected_answer: "" }]);
      }
    }
  }, [open, initialData]);

  const handleAddItem = () => {
    setItems([...items, { question: "", expected_answer: "" }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter out empty items
    const validItems = items.filter(item => item.question?.trim() !== "");
    onSubmit({ name, items: validItems, dataset_id: initialData?.dataset_id });
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} className="w-full max-w-2xl bg-slate-900 border-slate-700">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 text-slate-200">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            Create Golden Dataset
          </h2>
          <p className="text-sm text-slate-400">
            Define a set of verified questions and expected answers. This will act as the master exam for evaluating the AI's accuracy.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Dataset Name</label>
          <Input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="e.g., HR Policies Benchmark v1"
            required
            className="bg-slate-950 border-slate-800 text-slate-200 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300">Test Items ({items.length})</label>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleAddItem}
              className="h-8 text-xs bg-slate-800 border-slate-700 hover:bg-slate-700"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Question
            </Button>
          </div>

          <div className="flex flex-col gap-4 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex flex-col gap-3 p-4 rounded-xl bg-black/40 border border-slate-800 relative group">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleRemoveItem(idx)}
                    className="h-7 w-7 p-0 text-rose-500 hover:bg-rose-500/10 hover:text-rose-400"
                    disabled={items.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-1.5 pr-8">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Question</label>
                  <Input 
                    value={item.question} 
                    onChange={(e) => handleItemChange(idx, "question", e.target.value)} 
                    placeholder="What is the sick leave policy?"
                    className="bg-slate-900 border-slate-700 text-sm"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Expected Answer</label>
                  <textarea 
                    value={item.expected_answer} 
                    onChange={(e) => handleItemChange(idx, "expected_answer", e.target.value)} 
                    placeholder="Employees get 10 days of paid sick leave per year..."
                    className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px] resize-y"
                    required
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white" disabled={isPending}>
            {isPending ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Dataset</>}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
