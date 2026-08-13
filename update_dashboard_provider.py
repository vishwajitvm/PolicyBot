import os
import re

file_path = r'c:\python\policybot\frontend\src\features\dashboard\DashboardPage.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace modelFilter with providerFilter
content = content.replace("modelFilter", "providerFilter")
content = content.replace("setModelFilter", "setProviderFilter")
content = content.replace("modelFilter === undefined", "providerFilter === undefined")

# Update dropdown rendering
old_dropdown = r'''            <div className="flex items-center gap-3 glass-panel p-2 rounded-xl">
              <label className="text-sm text-gray-400 font-medium px-2">Model:</label>
              <select 
                className="bg-black/40 border border-white/10 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block p-2 backdrop-blur-md outline-none transition-all cursor-pointer"
                value={providerFilter === undefined ? "all" : providerFilter}
                onChange={(e) => setProviderFilter(e.target.value === "all" ? undefined : e.target.value)}
              >
                <option value="all">All Models</option>
                {baseStatsData?.unique_models_list?.map((modelStr) => (
                  <option key={modelStr} value={modelStr.split(" / ")[1]}>{modelStr.split(" / ")[1]}</option>
                ))}
              </select>
            </div>'''

new_dropdown = r'''            <div className="flex items-center gap-3 glass-panel p-2 rounded-xl">
              <label className="text-sm text-gray-400 font-medium px-2">LLM Provider:</label>
              <select 
                className="bg-black/40 border border-white/10 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block p-2 backdrop-blur-md outline-none transition-all cursor-pointer"
                value={providerFilter === undefined ? "all" : providerFilter}
                onChange={(e) => setProviderFilter(e.target.value === "all" ? undefined : e.target.value)}
              >
                <option value="all">All Providers</option>
                {Array.from(new Set(baseStatsData?.unique_models_list?.map(m => m.split(" / ")[0]) || [])).filter(Boolean).map((prov) => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            </div>'''
content = content.replace(old_dropdown, new_dropdown)

# Update Active Models Modal
old_modal_list = r'''              <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {statsData?.unique_models_list?.map((modelStr, idx) => {'''
new_modal_list = r'''              <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {(providerFilter ? statsData?.unique_models_list?.filter(m => m.split(" / ")[0] === providerFilter) : statsData?.unique_models_list)?.map((modelStr, idx) => {'''
content = content.replace(old_modal_list, new_modal_list)

# Fix Charts Overlap properly with XAxis height instead of CSS hacks
# Tokens Chart
tokens_chart_old = r'''                <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 120 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" tick={{fill: '#e4e4e7', fontSize: 12, fontWeight: 500}} axisLine={{stroke: 'rgba(255,255,255,0.1)'}} tickMargin={10} angle={-45} textAnchor="end" interval={0} />
                  <YAxis tick={{fill: '#a1a1aa', fontSize: 12}} axisLine={{stroke: 'rgba(255,255,255,0.1)'}} />
                  <Tooltip 
                    cursor={{fill: 'rgba(var(--text), 0.05)'}}
                    contentStyle={{ backgroundColor: 'rgb(var(--panel))', border: '1px solid rgb(var(--border))', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ color: '#00dcc8' }}
                  />
                  <Legend verticalAlign="bottom" wrapperStyle={{ position: 'relative', top: '110px' }} />'''

tokens_chart_new = r'''                <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" height={120} tick={{fill: '#e4e4e7', fontSize: 12, fontWeight: 500}} axisLine={{stroke: 'rgba(255,255,255,0.1)'}} tickMargin={10} angle={-45} textAnchor="end" interval={0} />
                  <YAxis tick={{fill: '#a1a1aa', fontSize: 12}} axisLine={{stroke: 'rgba(255,255,255,0.1)'}} />
                  <Tooltip 
                    cursor={{fill: 'rgba(var(--text), 0.05)'}}
                    contentStyle={{ backgroundColor: 'rgb(var(--panel))', border: '1px solid rgb(var(--border))', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ color: '#00dcc8' }}
                  />
                  <Legend verticalAlign="bottom" />'''
content = content.replace(tokens_chart_old, tokens_chart_new)

# Latency Chart
latency_chart_old = r'''                <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 120 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" tick={{fill: '#e4e4e7', fontSize: 12, fontWeight: 500}} axisLine={{stroke: 'rgba(255,255,255,0.1)'}} tickMargin={10} angle={-45} textAnchor="end" interval={0} />
                  <YAxis yAxisId="left" tick={{fill: '#a1a1aa', fontSize: 12}} axisLine={{stroke: 'rgba(255,255,255,0.1)'}} />
                  <YAxis yAxisId="right" orientation="right" tick={{fill: '#a1a1aa', fontSize: 12}} axisLine={{stroke: 'rgba(255,255,255,0.1)'}} />
                  <Tooltip 
                    cursor={{fill: 'rgba(var(--text), 0.05)'}}
                    contentStyle={{ backgroundColor: 'rgb(var(--panel))', border: '1px solid rgb(var(--border))', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                  />
                  <Legend verticalAlign="bottom" wrapperStyle={{ position: 'relative', top: '110px' }} />'''

latency_chart_new = r'''                <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" height={120} tick={{fill: '#e4e4e7', fontSize: 12, fontWeight: 500}} axisLine={{stroke: 'rgba(255,255,255,0.1)'}} tickMargin={10} angle={-45} textAnchor="end" interval={0} />
                  <YAxis yAxisId="left" tick={{fill: '#a1a1aa', fontSize: 12}} axisLine={{stroke: 'rgba(255,255,255,0.1)'}} />
                  <YAxis yAxisId="right" orientation="right" tick={{fill: '#a1a1aa', fontSize: 12}} axisLine={{stroke: 'rgba(255,255,255,0.1)'}} />
                  <Tooltip 
                    cursor={{fill: 'rgba(var(--text), 0.05)'}}
                    contentStyle={{ backgroundColor: 'rgb(var(--panel))', border: '1px solid rgb(var(--border))', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                  />
                  <Legend verticalAlign="bottom" />'''
content = content.replace(latency_chart_old, latency_chart_new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("DashboardPage updated.")
