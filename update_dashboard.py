import re

with open(r'c:\python\policybot\frontend\src\features\dashboard\DashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Change grid-cols-2 to grid-cols-1 for LLM Analytics
content = re.sub(
    r'<h3 className="font-semibold text-xl mb-6 text-glow">LLM Analytics & Fallback Performance</h3>\s*<div className="grid gap-8 lg:grid-cols-2">',
    '<h3 className="font-semibold text-xl mb-6 text-glow">LLM Analytics & Fallback Performance</h3>\n        <div className="grid gap-8 lg:grid-cols-1">',
    content
)

# 2. Add the Real-time Query Latency Trend graph next to RAG Accuracy
accuracy_block = r'''      {/* Accuracy Trend */}
      <div className="glass-card p-6 relative group">
        <div className="absolute inset-0 bg-secondary/5 blur-2xl rounded-xl group-hover:bg-secondary/10 transition-colors pointer-events-none"></div>
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div>
            <h3 className="font-semibold text-xl text-glow">RAG Accuracy & Confidence Trend</h3>
            <p className="text-xs text-gray-400 mt-1">Formula: Evaluated answer confidence score extracted directly from live query traces.</p>
          </div>
        </div>
        <div className="h-64 relative w-full glass-panel p-4 z-10">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={accuracyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="time" tick={{fill: '#a1a1aa', fontSize: 12}} axisLine={{stroke: 'rgba(255,255,255,0.1)'}} />
              <YAxis domain={[0, 100]} tick={{fill: '#a1a1aa', fontSize: 12}} axisLine={{stroke: 'rgba(255,255,255,0.1)'}} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgb(var(--panel))', border: '1px solid rgb(var(--border))', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                itemStyle={{ color: '#b464ff' }}
              />
              <Legend wrapperStyle={{paddingTop: '20px'}}/>
              <Line type="monotone" dataKey="confidence" stroke="#b464ff" strokeWidth={3} dot={{ fill: '#b464ff', strokeWidth: 2 }} activeDot={{ r: 8 }} name="Confidence (%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>'''

new_accuracy_block = r'''      {/* Accuracy & Latency Trend Row */}
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
        </div>
      </div>'''

content = content.replace(accuracy_block, new_accuracy_block)

with open(r'c:\python\policybot\frontend\src\features\dashboard\DashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
