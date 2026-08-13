import React, { useEffect, useState } from 'react';
import { getWorkflowConfig, updateWorkflowConfig, WorkflowConfig } from '../../api/workflow.api';
import Swal from 'sweetalert2';
import { GripVertical, Save, RefreshCw, Server, Cpu, Database } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const WorkflowPage: React.FC = () => {
  const [config, setConfig] = useState<WorkflowConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Drag state
  const [draggingItem, setDraggingItem] = useState<{ list: 'llm' | 'embedding', index: number } | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await getWorkflowConfig();
      setConfig(res.data);
    } catch (error) {
      console.error(error);
      Swal.fire({ title: 'Error', text: 'Failed to load workflow configuration', icon: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, list: 'llm' | 'embedding', index: number) => {
    setDraggingItem({ list, index });
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to prevent visual glitch on drag start
    setTimeout(() => {
      if (e.target instanceof HTMLElement) {
        e.target.style.opacity = '0.5';
      }
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent, list: 'llm' | 'embedding', index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, list: 'llm' | 'embedding', dropIndex: number) => {
    e.preventDefault();
    if (!config || !draggingItem || draggingItem.list !== list) return;
    
    const newConfig = { ...config };
    const listKey = list === 'llm' ? 'llm_fallback_providers' : 'embedding_fallback_providers';
    
    const items = [...newConfig[listKey]];
    const [draggedItem] = items.splice(draggingItem.index, 1);
    items.splice(dropIndex, 0, draggedItem);
    
    newConfig[listKey] = items;
    setConfig(newConfig);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggingItem(null);
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = '1';
    }
  };

  const saveConfig = async () => {
    if (!config) return;
    
    const confirm = await Swal.fire({
      title: 'Save Workflow?',
      text: 'This will update the active provider fallback chain instantly.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: 'rgb(20, 184, 166)',
      cancelButtonColor: 'rgb(39, 39, 42)',
      background: 'rgb(24, 24, 27)',
      color: '#fff',
      confirmButtonText: 'Yes, Save it!'
    });

    if (confirm.isConfirmed) {
      setSaving(true);
      try {
        await updateWorkflowConfig(config);
        Swal.fire({
          title: 'Saved!',
          text: 'Workflow configuration has been updated.',
          icon: 'success',
          background: 'rgb(24, 24, 27)',
          color: '#fff',
          confirmButtonColor: 'rgb(20, 184, 166)'
        });
      } catch (error) {
        Swal.fire({ title: 'Error', text: 'Failed to save configuration.', icon: 'error' });
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading) return (
    <div className="flex h-[calc(100vh-2rem)] items-center justify-center">
      <RefreshCw className="h-10 w-10 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">AI Workflow Configuration</h1>
          <p className="text-gray-400 text-sm mt-1">Drag and drop providers to construct your execution and fallback chains.</p>
        </div>
        <Button onClick={saveConfig} disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(20,184,166,0.3)] gap-2">
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving...' : 'Save Workflow'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LLM Fallback Chain */}
        <div className="bg-panel border border-border/50 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20 text-primary">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">LLM Generation Chain</h2>
              <p className="text-xs text-gray-400">Order of execution. Fails over top to bottom.</p>
            </div>
          </div>

          <div className="space-y-3 relative z-10">
            {config?.llm_fallback_providers.map((provider, index) => (
              <div
                key={`llm-${provider}`}
                draggable
                onDragStart={(e) => handleDragStart(e, 'llm', index)}
                onDragOver={(e) => handleDragOver(e, 'llm', index)}
                onDrop={(e) => handleDrop(e, 'llm', index)}
                onDragEnd={handleDragEnd}
                className="flex items-center gap-4 p-4 rounded-xl bg-background/50 border border-border/50 cursor-grab active:cursor-grabbing hover:border-primary/50 hover:bg-background transition-all"
              >
                <div className="text-muted cursor-grab"><GripVertical className="h-5 w-5" /></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white capitalize">{provider}</span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      Step {index + 1}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Embedding Fallback Chain */}
        <div className="bg-panel border border-border/50 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-500">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Embedding Models</h2>
              <p className="text-xs text-gray-400">Drag HuggingFace models here for fast local vectors.</p>
            </div>
          </div>

          <div className="space-y-3 relative z-10">
            {config?.embedding_fallback_providers.map((provider, index) => (
              <div
                key={`emb-${provider}`}
                draggable
                onDragStart={(e) => handleDragStart(e, 'embedding', index)}
                onDragOver={(e) => handleDragOver(e, 'embedding', index)}
                onDrop={(e) => handleDrop(e, 'embedding', index)}
                onDragEnd={handleDragEnd}
                className="flex items-center gap-4 p-4 rounded-xl bg-background/50 border border-border/50 cursor-grab active:cursor-grabbing hover:border-blue-500/50 hover:bg-background transition-all"
              >
                <div className="text-muted cursor-grab"><GripVertical className="h-5 w-5" /></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white capitalize">{provider}</span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                      Step {index + 1}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
