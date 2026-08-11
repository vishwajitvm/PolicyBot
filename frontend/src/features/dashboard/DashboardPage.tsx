import { useQuery } from "@tanstack/react-query";
import { getHealth } from "../../api/health.api";
import { getDashboardStats } from "../../api/dashboard.api";
import { getMetrics } from "../../api/metrics.api";
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
} from "recharts";

export function DashboardPageFeature() {
  const { data: healthData, error: healthError } = useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
    retry: false
  });
  
  const { data: statsData } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
    retry: false
  });

  const { data: metricsData } = useQuery({
    queryKey: ["metrics"],
    queryFn: getMetrics,
    retry: false
  });

  // Prepare chart data
  const chartData = metricsData?.metrics.map(m => ({
    name: `${m.provider} (${m.model})`,
    tokens: m.total_tokens,
    errors: m.failed_requests,
    latency: m.avg_latency_ms
  })) || [];

  return (
    <div className="space-y-6">
      {/* Top Cards Row */}
      <DashboardCards stats={statsData} />

      {/* Main Analytics Section */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-xl mb-6 text-glow">LLM Analytics & Fallback Performance</h3>
        <div className="grid gap-8 lg:grid-cols-2">
          
          <div className="h-80 relative group">
            <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full group-hover:bg-primary/10 transition-colors"></div>
            <h4 className="text-sm font-medium mb-4 text-primary tracking-wider uppercase">Tokens Consumed by Model</h4>
            <div className="relative h-full w-full glass-panel p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" tick={{fill: '#a1a1aa', fontSize: 12}} axisLine={{stroke: 'rgba(255,255,255,0.1)'}} />
                  <YAxis tick={{fill: '#a1a1aa', fontSize: 12}} axisLine={{stroke: 'rgba(255,255,255,0.1)'}} />
                  <Tooltip 
                    cursor={{fill: 'rgba(var(--text), 0.05)'}}
                    contentStyle={{ backgroundColor: 'rgb(var(--panel))', border: '1px solid rgb(var(--border))', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ color: '#00dcc8' }}
                  />
                  <Legend wrapperStyle={{paddingTop: '20px'}}/>
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
          
          <div className="h-80 relative group">
             <div className="absolute inset-0 bg-secondary/5 blur-2xl rounded-full group-hover:bg-secondary/10 transition-colors"></div>
            <h4 className="text-sm font-medium mb-4 text-secondary tracking-wider uppercase">Latency & Error Rates</h4>
            <div className="relative h-full w-full glass-panel p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" tick={{fill: '#a1a1aa', fontSize: 12}} axisLine={{stroke: 'rgba(255,255,255,0.1)'}} />
                  <YAxis yAxisId="left" tick={{fill: '#a1a1aa', fontSize: 12}} axisLine={{stroke: 'rgba(255,255,255,0.1)'}} />
                  <YAxis yAxisId="right" orientation="right" tick={{fill: '#a1a1aa', fontSize: 12}} axisLine={{stroke: 'rgba(255,255,255,0.1)'}} />
                  <Tooltip 
                    cursor={{fill: 'rgba(var(--text), 0.05)'}}
                    contentStyle={{ backgroundColor: 'rgb(var(--panel))', border: '1px solid rgb(var(--border))', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ color: '#b464ff' }}
                  />
                  <Legend wrapperStyle={{paddingTop: '20px'}}/>
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
      
      {/* Infrastructure Section */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-xl mb-6 text-glow">System Infrastructure Health</h3>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="p-5 glass-panel relative overflow-hidden group hover:border-primary/50 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-all"></div>
            <p className="text-sm text-gray-400 mb-2 uppercase tracking-wide">Backend API</p>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full shadow-[0_0_10px] ${healthData?.status === "ok" ? "bg-green-400 shadow-green-400/50" : "bg-red-400 shadow-red-400/50"}`}></div>
              <p className="text-2xl font-light text-white">
                {healthData?.status ?? (healthError ? "Offline" : "Checking...")}
              </p>
            </div>
          </div>
          
          <div className="p-5 glass-panel relative overflow-hidden group hover:border-secondary/50 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/10 rounded-full blur-xl group-hover:bg-secondary/20 transition-all"></div>
            <p className="text-sm text-gray-400 mb-2 uppercase tracking-wide">MongoDB Store</p>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full shadow-[0_0_10px] ${healthData?.mongodb.status === "ok" ? "bg-green-400 shadow-green-400/50" : "bg-yellow-400 shadow-yellow-400/50"}`}></div>
              <p className="text-2xl font-light text-white">
                {healthData?.mongodb.status ?? "Unknown"}
              </p>
            </div>
          </div>
          
          <div className="p-5 glass-panel relative overflow-hidden group hover:border-white/50 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-all"></div>
            <p className="text-sm text-gray-400 mb-2 uppercase tracking-wide">Vector DB (Qdrant)</p>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full shadow-[0_0_10px] ${healthData?.vector_store.status === "ok" ? "bg-green-400 shadow-green-400/50" : "bg-yellow-400 shadow-yellow-400/50"}`}></div>
              <p className="text-2xl font-light text-white">
                {healthData?.vector_store.status ?? "Unknown"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
