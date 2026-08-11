import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getModels } from "../../api/models.api";
import { updateApiKey } from "../../api/config.api";
import { KeyRound, CheckCircle2, Loader2, Server } from "lucide-react";

export function ModelManagerFeature() {
  const { data: modelsData, isLoading } = useQuery({
    queryKey: ["models"],
    queryFn: getModels,
  });

  const [keys, setKeys] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<Record<string, 'idle' | 'saving' | 'success' | 'error'>>({});

  const mutation = useMutation({
    mutationFn: ({ provider, key }: { provider: string, key: string }) => updateApiKey(provider, key),
    onMutate: ({ provider }) => {
      setSaveStatus(prev => ({ ...prev, [provider]: 'saving' }));
    },
    onSuccess: (_, { provider }) => {
      setSaveStatus(prev => ({ ...prev, [provider]: 'success' }));
      setTimeout(() => setSaveStatus(prev => ({ ...prev, [provider]: 'idle' })), 3000);
    },
    onError: (_, { provider }) => {
      setSaveStatus(prev => ({ ...prev, [provider]: 'error' }));
    }
  });

  const handleSaveKey = (provider: string) => {
    const key = keys[provider];
    if (key) {
      mutation.mutate({ provider, key });
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 animate-slide-in">
      {/* Active Fallback Sequence */}
      <div className="glass-card p-6 relative overflow-hidden">
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex items-center gap-3 mb-6">
          <Server className="text-primary w-6 h-6" />
          <h2 className="text-2xl font-semibold text-glow">Active LLM Fallback Sequence</h2>
        </div>
        <p className="text-gray-400 mb-8 max-w-2xl">
          PolicyBot automatically routes requests through this sequence. If a primary provider experiences downtime or rate limits, the next provider in the chain seamlessly takes over.
        </p>
        
        <div className="flex flex-wrap gap-3">
          {["gemini", "nvidia", "groq", "openai", "ollama", "huggingface", "mistral", "deepseek"].map((provider, i) => (
            <div key={provider} className="flex items-center gap-3">
              <div className="flex items-center justify-center px-4 py-2 bg-panel/60 border border-primary/30 rounded-xl shadow-[0_0_15px_rgba(0,220,200,0.1)] text-text text-sm font-medium tracking-wide uppercase">
                <span className="text-primary mr-2 opacity-50">{i + 1}.</span> {provider}
              </div>
              {i < 7 && <span className="text-primary/40">→</span>}
            </div>
          ))}
        </div>
      </div>
      
      {/* Available Models & API Keys */}
      <h3 className="text-xl font-semibold mt-10 mb-6 text-glow pl-2 flex items-center gap-2">
        <KeyRound className="w-5 h-5 text-secondary" /> 
        Provider Configuration & API Keys
      </h3>
      
      <div className="grid gap-6 lg:grid-cols-2">
        {modelsData && Object.entries(modelsData).map(([provider, models]) => (
          <div key={provider} className="glass-card flex flex-col h-full hover:border-primary/20 transition-all">
            {/* Provider Header & Key Input */}
            <div className="p-5 border-b border-border bg-panel/30">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-lg uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-text to-muted">
                  {provider}
                </h4>
                <span className="text-xs font-medium px-2 py-1 bg-panel border-border rounded text-muted border">
                  {models.length} Models
                </span>
              </div>
              
              {provider !== 'ollama' && (
                <div className="flex items-center gap-2 relative">
                  <input 
                    type="password" 
                    placeholder={`Enter ${provider.toUpperCase()} API Key`}
                    className="glass-input flex-1 py-2 px-3 text-sm"
                    value={keys[provider] || ''}
                    onChange={(e) => setKeys({...keys, [provider]: e.target.value})}
                  />
                  <button 
                    onClick={() => handleSaveKey(provider)}
                    disabled={!keys[provider] || saveStatus[provider] === 'saving'}
                    className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saveStatus[provider] === 'saving' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : saveStatus[provider] === 'success' ? (
                      <><CheckCircle2 className="w-4 h-4" /> Saved</>
                    ) : (
                      'Save Key'
                    )}
                  </button>
                </div>
              )}
              {provider === 'ollama' && (
                <p className="text-xs text-gray-500 italic">Ollama runs locally and does not require an API key.</p>
              )}
            </div>
            
            {/* Model List */}
            <div className="p-5 flex-1 bg-gradient-to-b from-transparent to-panel/10">
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {models.map(model => (
                  <div key={model.id} className="flex flex-col p-3 glass-panel border-border hover:bg-panel/50 transition-colors">
                    <span className="font-medium text-sm text-text">{model.name}</span>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500 truncate max-w-[200px]" title={model.id}>{model.id}</span>
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${
                        model.type === 'chat' 
                          ? 'bg-primary/10 text-primary border-primary/30' 
                          : 'bg-secondary/10 text-secondary border-secondary/30'
                      }`}>
                        {model.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
