import re

with open(r'c:\python\policybot\frontend\src\features\dashboard\DashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Latency Graph with Daily Requests Volume Graph
latency_block = r'''        <div className="glass-card p-6 relative group">
          <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-xl group-hover:bg-primary/10 transition-colors pointer-events-none"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <h3 className="font-semibold text-xl text-glow">Real-time Query Latency Trend</h3>
              <p className="text-xs text-gray-400 mt-1">Formula: End-to-end response time extracted directly from live query traces.</p>
            </div>
          </div>
          <div className="h-72 relative w-full glass-panel p-4 z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={accuracyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                <defs>
                  <linearGradient id="colorLatencyArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" tick={{fill: '#a1a1aa', fontSize: 12}} axisLine={{stroke: 'rgba(255,255,255,0.1)'}} />
                <YAxis tick={{fill: '#a1a1aa', fontSize: 12}} axisLine={{stroke: 'rgba(255,255,255,0.1)'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgb(var(--panel))', border: '1px solid rgb(var(--border))', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                  itemStyle={{ color: '#f59e0b' }}
                />
                <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px' }}/>
                <Area type="monotone" dataKey="latency" stroke="#f59e0b" fillOpacity={1} fill="url(#colorLatencyArea)" name="Latency (ms)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>'''

requests_block = r'''        <div className="glass-card p-6 relative group">
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
        </div>'''

if latency_block in content:
    content = content.replace(latency_block, requests_block)
    with open(r'c:\python\policybot\frontend\src\features\dashboard\DashboardPage.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Replaced Latency graph successfully")
else:
    print("Could not find latency block")
