import re

with open(r'c:\python\policybot\frontend\src\features\dashboard\DashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Tokens Consumed Chart
tokens_chart = r'''            <div className="relative h-[300px] w-full glass-panel p-4 z-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" tick={{fill: '#a1a1aa', fontSize: 10}} axisLine={{stroke: 'rgba(255,255,255,0.1)'}} angle={-35} textAnchor="end" interval={0} />
                  <YAxis tick={{fill: '#a1a1aa', fontSize: 12}} axisLine={{stroke: 'rgba(255,255,255,0.1)'}} />
                  <Tooltip 
                    cursor={{fill: 'rgba(var(--text), 0.05)'}}
                    contentStyle={{ backgroundColor: 'rgb(var(--panel))', border: '1px solid rgb(var(--border))', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ color: '#00dcc8' }}
                  />
                  <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '40px' }}/>'''

new_tokens_chart = r'''            <div className="relative h-[450px] w-full glass-panel p-4 pb-10 z-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 120 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" tick={{fill: '#e4e4e7', fontSize: 12, fontWeight: 500}} axisLine={{stroke: 'rgba(255,255,255,0.1)'}} tickMargin={10} angle={-45} textAnchor="end" interval={0} />
                  <YAxis tick={{fill: '#a1a1aa', fontSize: 12}} axisLine={{stroke: 'rgba(255,255,255,0.1)'}} />
                  <Tooltip 
                    cursor={{fill: 'rgba(var(--text), 0.05)'}}
                    contentStyle={{ backgroundColor: 'rgb(var(--panel))', border: '1px solid rgb(var(--border))', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ color: '#00dcc8' }}
                  />
                  <Legend verticalAlign="bottom" wrapperStyle={{ position: 'relative', top: '110px' }} />'''

# Fix Latency & Error Rates Chart
latency_chart = r'''            <div className="relative h-[300px] w-full glass-panel p-4 z-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" tick={{fill: '#a1a1aa', fontSize: 10}} axisLine={{stroke: 'rgba(255,255,255,0.1)'}} angle={-35} textAnchor="end" interval={0} />
                  <YAxis yAxisId="left" tick={{fill: '#a1a1aa', fontSize: 12}} axisLine={{stroke: 'rgba(255,255,255,0.1)'}} />
                  <YAxis yAxisId="right" orientation="right" tick={{fill: '#a1a1aa', fontSize: 12}} axisLine={{stroke: 'rgba(255,255,255,0.1)'}} />
                  <Tooltip 
                    cursor={{fill: 'rgba(var(--text), 0.05)'}}
                    contentStyle={{ backgroundColor: 'rgb(var(--panel))', border: '1px solid rgb(var(--border))', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                  />
                  <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '40px' }}/>'''

new_latency_chart = r'''            <div className="relative h-[450px] w-full glass-panel p-4 pb-10 z-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 120 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" tick={{fill: '#e4e4e7', fontSize: 12, fontWeight: 500}} axisLine={{stroke: 'rgba(255,255,255,0.1)'}} tickMargin={10} angle={-45} textAnchor="end" interval={0} />
                  <YAxis yAxisId="left" tick={{fill: '#a1a1aa', fontSize: 12}} axisLine={{stroke: 'rgba(255,255,255,0.1)'}} />
                  <YAxis yAxisId="right" orientation="right" tick={{fill: '#a1a1aa', fontSize: 12}} axisLine={{stroke: 'rgba(255,255,255,0.1)'}} />
                  <Tooltip 
                    cursor={{fill: 'rgba(var(--text), 0.05)'}}
                    contentStyle={{ backgroundColor: 'rgb(var(--panel))', border: '1px solid rgb(var(--border))', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                  />
                  <Legend verticalAlign="bottom" wrapperStyle={{ position: 'relative', top: '110px' }} />'''

content = content.replace(tokens_chart, new_tokens_chart)
content = content.replace(latency_chart, new_latency_chart)

with open(r'c:\python\policybot\frontend\src\features\dashboard\DashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
