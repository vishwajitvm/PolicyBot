import { useState } from "react";
import { Activity, Database } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getHealth } from "../../api/health.api";
import { getDashboardStats } from "../../api/dashboard.api";
import { getMetrics } from "../../api/metrics.api";
import { listDatasets, listRuns } from "../../api/evaluation.api";
import { DashboardCards } from "./DashboardCards";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";

export function DashboardPageFeature() {
  const [daysFilter, setDaysFilter] = useState<number | undefined>(undefined);
  const [providerFilter, setProviderFilter] = useState<string | undefined>(undefined);
  const [isModelsModalOpen, setIsModelsModalOpen] = useState(false);

  const { data: healthData, error: healthError } = useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
    retry: false
  });
  
  // Base stats without model filter to get the full list of available models for the dropdown
  const { data: baseStatsData } = useQuery({
    queryKey: ["dashboard-stats-base", daysFilter],
    queryFn: () => getDashboardStats(daysFilter),
    retry: false
  });

  const { data: statsData } = useQuery({
    queryKey: ["dashboard-stats", daysFilter, providerFilter],
    queryFn: () => getDashboardStats(daysFilter, providerFilter),
    retry: false
  });

  const { data: metricsData } = useQuery({
    queryKey: ["metrics", daysFilter, providerFilter],
    queryFn: () => getMetrics(daysFilter, providerFilter),
    retry: false
  });

  const { data: datasets = [] } = useQuery({ 
    queryKey: ["datasets"], 
    queryFn: listDatasets, 
    retry: false 
  });
  
  const { data: runs = [] } = useQuery({ 
    queryKey: ["eval-runs"], 
    queryFn: listRuns, 
    retry: false 
  });

  // Calculate Dataset Insights
  const datasetInsights = datasets.map((ds: any) => {
    const dsRuns = runs.filter((r: any) => r.dataset_id === ds.dataset_id);
    const latestRun = dsRuns.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    return {
      name: ds.name,
      total_items: ds.items?.length || 0,
      passed: latestRun ? latestRun.passed : 0,
      failed: latestRun ? latestRun.failed : 0,
      hasRun: !!latestRun
    };
  }).filter(ds => ds.hasRun);

  const aggregateGoldenStats = datasetInsights.map(ds => ({
    name: ds.name,
    Passed: ds.passed,
    Failed: ds.failed
  }));

  // Extract unique LLM providers for the dropdown
  const uniqueProviders = Array.from(
    new Set(baseStatsData?.unique_models_list?.map(m => m.split(" / ")[0]).filter(Boolean) || [])
  );

  // Prepare chart data:
  // - "All Providers" → aggregate by LLM provider name
  // - Specific provider selected → show individual models
  const chartData = (() => {
    const metrics = metricsData?.metrics || [];
    if (!providerFilter) {
      // Aggregate by provider
      const providerMap = new Map<string, { tokens: number; errors: number; latency: number; count: number }>();
      for (const m of metrics) {
        const existing = providerMap.get(m.provider);
        if (existing) {
          existing.tokens += m.total_tokens;
          existing.errors += m.failed_requests;
          existing.latency += m.avg_latency_ms;
          existing.count += 1;
        } else {
          providerMap.set(m.provider, { tokens: m.total_tokens, errors: m.failed_requests, latency: m.avg_latency_ms, count: 1 });
        }
      }
      return Array.from(providerMap.entries()).map(([provider, data]) => ({
        name: provider,
        tokens: data.tokens,
        errors: data.errors,
        latency: Math.round(data.latency / data.count)
      }));
    } else {
      // Show individual models for the selected provider
      return metrics.map(m => ({
        name: m.model,
        tokens: m.total_tokens,
        errors: m.failed_requests,
        latency: m.avg_latency_ms
      }));
    }
  })();

  // Auto-calculate XAxis height based on longest label
  const maxLabelLength = chartData.reduce((max, d) => Math.max(max, d.name.length), 0);
  const xAxisHeight = Math.max(80, Math.min(200, maxLabelLength * 8 + 30));

  const timeseriesData = metricsData?.timeseries || [];
  
  const accuracyTrendData = statsData?.accuracy_trend?.map(t => {
    const d = new Date(t.timestamp);
    return {
      time: `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`,
      confidence: t.confidence,
      latency: t.latency
    };
  }) || [];

  return (
    <div className="space-y-6">
      
      {/* Date Filter & Title Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white tracking-tight">Analytics Command Center</h1>
          </div>
          <p className="text-gray-400 text-sm mt-1">Deep insights into RAG performance and model health</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 glass-panel p-2 rounded-xl">
            <label className="text-sm text-gray-400 font-semibold px-2">LLM Provider:</label>
            <select 
              className="bg-black/40 border border-white/10 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 backdrop-blur-md outline-none transition-all cursor-pointer min-w-[160px]"
              value={providerFilter === undefined ? "all" : providerFilter}
              onChange={(e) => setProviderFilter(e.target.value === "all" ? undefined : e.target.value)}
            >
              <option value="all">All Providers</option>
              {uniqueProviders.map((prov) => (
                <option key={prov} value={prov}>{prov}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-3 glass-panel p-2 rounded-xl">
            <label className="text-sm text-gray-400 font-medium px-2">Time Range:</label>
            <select 
              className="bg-black/40 border border-white/10 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block p-2 backdrop-blur-md outline-none transition-all cursor-pointer"
              value={daysFilter === undefined ? "all" : daysFilter}
              onChange={(e) => setDaysFilter(e.target.value === "all" ? undefined : Number(e.target.value))}
            >
              <option value="all">All Time</option>
              <option value="0">Today</option>
              <option value="1">Yesterday</option>
              <option value="3">Last 3 Days</option>
              <option value="7">Last Week</option>
              <option value="30">Last Month</option>
              <option value="90">Last 3 Months (Max)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Top Cards Row (Existing basic stats) */}
      <DashboardCards stats={statsData} health={healthData ? {
        status: healthData.status,
        mongodb: healthData.mongodb,
        vector_store: healthData.vector_store
      } : undefined} />

      {/* Advanced Stats Row */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-all"></div>
          <p className="text-sm text-gray-400 font-medium tracking-wide uppercase mb-1">Total Document Versions</p>
          <p className="text-3xl font-bold text-white">{statsData?.total_document_versions || 0}</p>
        </div>
        
        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-500/20 rounded-full blur-2xl group-hover:bg-orange-500/30 transition-all"></div>
          <p className="text-sm text-gray-400 font-medium tracking-wide uppercase mb-1">Duplicate Documents</p>
          <p className="text-3xl font-bold text-white">{statsData?.duplicate_documents || 0}</p>
          <p className="text-xs text-gray-500 mt-2">Versions existing beyond unique base docs</p>
        </div>

        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-500/20 rounded-full blur-2xl group-hover:bg-green-500/30 transition-all"></div>
          <p className="text-sm text-gray-400 font-medium tracking-wide uppercase mb-1">Total Chat Sessions</p>
          <p className="text-3xl font-bold text-white">{statsData?.total_chat_sessions || 0}</p>
        </div>

        <div 
          className="glass-card p-5 relative overflow-hidden group cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => setIsModelsModalOpen(true)}
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/40 transition-all"></div>
          <p className="text-sm text-gray-400 font-medium tracking-wide uppercase mb-1">Active Models</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-bold text-white">{statsData?.unique_models_list?.length || 0}</p>
            <span className="text-xs px-3 py-1 bg-primary/20 text-primary rounded-full font-medium group-hover:bg-primary group-hover:text-black transition-colors">
              View All ➔
            </span>
          </div>
        </div>
      </div>

      {/* Timeseries Trends */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Usage Over Time */}
        <div className="glass-card p-6 relative group">
          <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-xl group-hover:bg-primary/10 transition-colors pointer-events-none"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <h3 className="font-semibold text-xl text-glow">Token Usage Over Time</h3>
              <p className="text-xs text-gray-400 mt-1">Formula: Sum of Input + Output Tokens for all requests on a given day.</p>
            </div>
          </div>
          <div className="h-64 relative w-full glass-panel p-4 z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeseriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTokensArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00dcc8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00dcc8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" tick={{fill: '#a1a1aa', fontSize: 12}} axisLine={{stroke: 'rgba(255,255,255,0.1)'}} />
                <YAxis tick={{fill: '#a1a1aa', fontSize: 12}} axisLine={{stroke: 'rgba(255,255,255,0.1)'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgb(var(--panel))', border: '1px solid rgb(var(--border))', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                  itemStyle={{ color: '#00dcc8' }}
                />
                <Legend wrapperStyle={{paddingTop: '20px'}}/>
                <Area type="monotone" dataKey="total_tokens" stroke="#00dcc8" fillOpacity={1} fill="url(#colorTokensArea)" name="Tokens" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Success vs Error Trends */}
        <div className="glass-card p-6 relative group">
          <div className="absolute inset-0 bg-secondary/5 blur-2xl rounded-xl group-hover:bg-secondary/10 transition-colors pointer-events-none"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <h3 className="font-semibold text-xl text-glow">Success vs Error Rate</h3>
              <p className="text-xs text-gray-400 mt-1">Formula: Success Rate = Successful Requests / Total Requests per day.</p>
            </div>
          </div>
          <div className="h-64 relative w-full glass-panel p-4 z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeseriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ade80" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorError" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" tick={{fill: '#a1a1aa', fontSize: 12}} axisLine={{stroke: 'rgba(255,255,255,0.1)'}} />
                <YAxis tickFormatter={(val) => `${(val * 100).toFixed(0)}%`} tick={{fill: '#a1a1aa', fontSize: 12}} axisLine={{stroke: 'rgba(255,255,255,0.1)'}} domain={[0, 1]} />
                <Tooltip 
                  formatter={(val: number) => [`${(val * 100).toFixed(1)}%`, ""]}
                  contentStyle={{ backgroundColor: 'rgb(var(--panel))', border: '1px solid rgb(var(--border))', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                />
                <Legend wrapperStyle={{paddingTop: '20px'}}/>
                <Area type="monotone" dataKey="success_rate" stroke="#4ade80" fillOpacity={1} fill="url(#colorSuccess)" name="Success Rate" />
                <Area type="monotone" dataKey="error_rate" stroke="#f87171" fillOpacity={1} fill="url(#colorError)" name="Error Rate" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Main Analytics Section */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-xl mb-6 text-glow">LLM Analytics & Fallback Performance</h3>
        <div className={`grid gap-8 ${providerFilter ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>
          
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full group-hover:bg-primary/10 transition-colors pointer-events-none"></div>
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-primary tracking-wider uppercase">
                {providerFilter ? `Tokens Consumed by Model (${providerFilter})` : 'Tokens Consumed by LLM Provider'}
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                {providerFilter ? `Individual model token usage for ${providerFilter}.` : 'Total aggregated tokens across all models per LLM provider.'}
              </p>
            </div>
            <div className="relative w-full glass-panel p-4" style={{ height: `${xAxisHeight + 320}px` }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" height={xAxisHeight} tick={{fill: '#ffffff', fontSize: 18, fontWeight: 900}} axisLine={{stroke: 'rgba(255,255,255,0.2)'}} angle={-35} textAnchor="end" interval={0} tickMargin={12} />
                  <YAxis tick={{fill: '#a1a1aa', fontSize: 14}} axisLine={{stroke: 'rgba(255,255,255,0.1)'}} />
                  <Tooltip 
                    cursor={{fill: 'rgba(var(--text), 0.05)'}}
                    contentStyle={{ backgroundColor: 'rgb(var(--panel))', border: '1px solid rgb(var(--border))', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ color: '#00dcc8' }}
                    labelStyle={{ color: '#fff', fontWeight: 700, fontSize: 14 }}
                  />
                  <Legend verticalAlign="top" wrapperStyle={{paddingBottom: '10px'}}/>
                  <Bar dataKey="tokens" fill="url(#colorTokens)" radius={[6, 6, 0, 0]} name="Total Tokens" />
                  <defs>
                    <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00dcc8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#00dcc8" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className={`relative group ${providerFilter ? '' : 'mt-8'}`}>
             <div className="absolute inset-0 bg-secondary/5 blur-2xl rounded-full group-hover:bg-secondary/10 transition-colors pointer-events-none"></div>
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-secondary tracking-wider uppercase">
                {providerFilter ? `Latency & Error Rates (${providerFilter})` : 'Latency & Error Rates by LLM Provider'}
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                {providerFilter ? `Per-model latency and errors for ${providerFilter}.` : 'Average latency and error counts aggregated per LLM provider.'}
              </p>
            </div>
            <div className="relative w-full glass-panel p-4" style={{ height: `${xAxisHeight + 320}px` }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" height={xAxisHeight} tick={{fill: '#ffffff', fontSize: 18, fontWeight: 900}} axisLine={{stroke: 'rgba(255,255,255,0.2)'}} angle={-35} textAnchor="end" interval={0} tickMargin={12} />
                  <YAxis yAxisId="left" tick={{fill: '#a1a1aa', fontSize: 14}} axisLine={{stroke: 'rgba(255,255,255,0.1)'}} />
                  <YAxis yAxisId="right" orientation="right" tick={{fill: '#a1a1aa', fontSize: 14}} axisLine={{stroke: 'rgba(255,255,255,0.1)'}} />
                  <Tooltip 
                    cursor={{fill: 'rgba(var(--text), 0.05)'}}
                    contentStyle={{ backgroundColor: 'rgb(var(--panel))', border: '1px solid rgb(var(--border))', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                    labelStyle={{ color: '#fff', fontWeight: 700, fontSize: 14 }}
                  />
                  <Legend verticalAlign="top" wrapperStyle={{paddingBottom: '10px'}}/>
                  <Bar yAxisId="left" dataKey="latency" fill="url(#colorLatency)" radius={[6, 6, 0, 0]} name="Latency (ms)" />
                  <Bar yAxisId="right" dataKey="errors" fill="url(#colorErrors)" radius={[6, 6, 0, 0]} name="Error Count" />
                  <defs>
                    <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#b464ff" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#b464ff" stopOpacity={0.2}/>
                    </linearGradient>
                    <linearGradient id="colorErrors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ff4444" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>

      {/* Accuracy & Latency Trend Row */}
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="glass-card p-6 relative group">
          <div className="absolute inset-0 bg-secondary/5 blur-2xl rounded-xl group-hover:bg-secondary/10 transition-colors pointer-events-none"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <h3 className="font-semibold text-xl text-glow">RAG Accuracy & Confidence Trend</h3>
              <p className="text-xs text-gray-400 mt-1">Formula: Evaluated answer confidence score extracted directly from live query traces.</p>
            </div>
          </div>
          <div className="h-72 relative w-full glass-panel p-4 z-10">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={accuracyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" tick={{fill: '#a1a1aa', fontSize: 12}} axisLine={{stroke: 'rgba(255,255,255,0.1)'}} />
                <YAxis domain={[0, 100]} tick={{fill: '#a1a1aa', fontSize: 12}} axisLine={{stroke: 'rgba(255,255,255,0.1)'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgb(var(--panel))', border: '1px solid rgb(var(--border))', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                  itemStyle={{ color: '#b464ff' }}
                />
                <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px' }}/>
                <Line type="monotone" dataKey="confidence" stroke="#b464ff" strokeWidth={3} dot={{ fill: '#b464ff', strokeWidth: 2 }} activeDot={{ r: 8 }} name="Confidence (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 relative group">
          <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-xl group-hover:bg-primary/10 transition-colors pointer-events-none"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <h3 className="font-semibold text-xl text-glow">Daily Requests Volume</h3>
              <p className="text-xs text-gray-400 mt-1">Formula: Total queries processed by the models per day.</p>
            </div>
          </div>
          <div className="h-72 relative w-full glass-panel p-4 z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeseriesData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                <defs>
                  <linearGradient id="colorRequestsArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" tick={{fill: '#a1a1aa', fontSize: 12}} axisLine={{stroke: 'rgba(255,255,255,0.1)'}} />
                <YAxis tick={{fill: '#a1a1aa', fontSize: 12}} axisLine={{stroke: 'rgba(255,255,255,0.1)'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgb(var(--panel))', border: '1px solid rgb(var(--border))', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px' }}/>
                <Area type="monotone" dataKey="total_requests" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRequestsArea)" name="Total Requests" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Metrics Table */}
      <div className="glass-card p-6 overflow-hidden">
        <h3 className="font-semibold text-xl mb-6 text-glow">Detailed LLM Performance Report</h3>
        <div className="overflow-x-auto glass-panel rounded-xl">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xl font-bold text-gray-300 uppercase bg-black/20 border-b border-white/5">
              <tr>
                <th scope="col" className="px-6 py-4">Provider</th>
                <th scope="col" className="px-6 py-4">Model</th>
                <th scope="col" className="px-6 py-4">Endpoint Type</th>
                <th scope="col" className="px-6 py-4">Requests (Success/Fail)</th>
                <th scope="col" className="px-6 py-4">Success Rate</th>
                <th scope="col" className="px-6 py-4">Error Rate</th>
                <th scope="col" className="px-6 py-4">Total Tokens</th>
                <th scope="col" className="px-6 py-4">Avg Latency (ms)</th>
              </tr>
            </thead>
            <tbody>
              {metricsData?.metrics.map((m, idx) => (
                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-lg font-bold text-white">{m.provider}</td>
                  <td className="px-6 py-4 text-lg"><span className="px-2 py-1 bg-white/10 rounded text-sm">{m.model}</span></td>
                  <td className="px-6 py-4 text-lg">{m.endpoint_type}</td>
                  <td className="px-6 py-4 text-lg">
                    {m.total_requests} 
                    <span className="text-gray-500 ml-2 text-sm">
                      (<span className="text-green-400">{m.successful_requests}</span>/<span className="text-red-400">{m.failed_requests}</span>)
                    </span>
                  </td>
                  <td className="px-6 py-4 text-lg">
                    <span className="text-green-400 font-semibold">
                      {(m.success_rate * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-lg">
                    <span className={m.error_rate > 0 ? "text-red-400 font-semibold" : "text-green-400"}>
                      {(m.error_rate * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-lg font-mono">{m.total_tokens.toLocaleString()}</td>
                  <td className="px-6 py-4 text-lg font-mono">{m.avg_latency_ms.toLocaleString()}</td>
                </tr>
              ))}
              {(!metricsData?.metrics || metricsData.metrics.length === 0) && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-400 text-lg">No performance data available for this time period.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Golden Dataset Evaluation Overview */}
      <div className="glass-card p-6 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold text-2xl text-white flex items-center gap-2">
                Golden Dataset Health
              </h3>
              <p className="text-sm text-gray-400 mt-1">Real-time pass/fail metrics from your latest evaluation runs.</p>
            </div>
          </div>
          
          {datasetInsights.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500 bg-black/20 rounded-2xl border border-white/5 border-dashed">
              <Database className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-lg">No evaluation runs found.</p>
              <p className="text-sm">Run an evaluation to see insights here.</p>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Left: Sleek List of Datasets */}
              <div className="lg:col-span-2 flex flex-col gap-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {datasetInsights.map((ds, idx) => {
                  const total = ds.passed + ds.failed;
                  const passRate = total > 0 ? Math.round((ds.passed / total) * 100) : 0;
                  const isPerfect = passRate === 100;
                  
                  return (
                    <div key={idx} className="group/item relative bg-black/30 border border-white/5 rounded-2xl p-5 flex items-center justify-between hover:bg-black/50 hover:border-white/10 transition-all duration-300">
                      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl transition-colors duration-300" 
                           style={{ backgroundColor: isPerfect ? '#4ade80' : (passRate > 50 ? '#facc15' : '#f87171') }}>
                      </div>
                      <div className="pl-4">
                        <h4 className="text-white font-semibold text-lg flex items-center gap-2">
                          {ds.name}
                          {isPerfect && <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20"><Activity className="w-3 h-3" /> Perfect</span>}
                        </h4>
                        <p className="text-sm text-gray-400 mt-1 flex items-center gap-4">
                          <span>{ds.total_items} Test Cases</span>
                          <span className="flex items-center gap-1 text-emerald-400"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> {ds.passed} Passed</span>
                          <span className="flex items-center gap-1 text-rose-400"><div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div> {ds.failed} Failed</span>
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="text-2xl font-bold text-white tracking-tight">{passRate}%</div>
                        <div className="w-24 h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/5">
                          <div className="h-full rounded-full" 
                               style={{ width: `${passRate}%`, backgroundColor: isPerfect ? '#4ade80' : (passRate > 50 ? '#facc15' : '#f87171') }}>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right: Aggregate Donut Chart */}
              <div className="glass-panel p-6 h-[400px] rounded-2xl flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
                <h4 className="text-sm font-bold tracking-widest uppercase text-gray-400 mb-2">Aggregate Results</h4>
                
                <div className="flex-1 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Passed', value: aggregateGoldenStats.reduce((acc, curr) => acc + curr.Passed, 0) },
                          { name: 'Failed', value: aggregateGoldenStats.reduce((acc, curr) => acc + curr.Failed, 0) }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        <Cell fill="#4ade80" />
                        <Cell fill="#f87171" />
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgb(var(--panel))', border: '1px solid rgb(var(--border))', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                        formatter={(value: number) => [value, 'Tests']}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-8">
                    <span className="text-4xl font-black text-white">
                      {(() => {
                        const pass = aggregateGoldenStats.reduce((acc, curr) => acc + curr.Passed, 0);
                        const fail = aggregateGoldenStats.reduce((acc, curr) => acc + curr.Failed, 0);
                        const total = pass + fail;
                        return total > 0 ? Math.round((pass / total) * 100) : 0;
                      })()}%
                    </span>
                    <span className="text-xs font-semibold text-gray-400 tracking-widest uppercase mt-1">Global Pass Rate</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Models Modal */}
      {isModelsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg p-6 relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsModelsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
            <h3 className="text-2xl font-semibold text-white mb-2">
              {providerFilter ? `Models for ${providerFilter}` : 'All Available Models'}
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              {providerFilter 
                ? `Showing models belonging to the "${providerFilter}" LLM provider.`
                : 'List of all AI models that have been used by this system.'}
            </p>
            
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {(providerFilter 
                ? statsData?.unique_models_list?.filter(m => m.split(" / ")[0] === providerFilter)
                : statsData?.unique_models_list
              )?.map((modelStr, idx) => {
                const [provider, modelName] = modelStr.split(" / ");
                return (
                  <div key={idx} className="glass-panel p-4 flex items-center justify-between group hover:bg-white/5 transition-colors rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {provider.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{modelName}</p>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">{provider}</p>
                      </div>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                  </div>
                );
              })}
              {(!statsData?.unique_models_list || (providerFilter 
                ? statsData.unique_models_list.filter(m => m.split(" / ")[0] === providerFilter).length === 0
                : statsData.unique_models_list.length === 0)) && (
                <div className="text-center py-8 text-gray-500">
                  No models found{providerFilter ? ` for provider "${providerFilter}"` : ' in the database'}.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
