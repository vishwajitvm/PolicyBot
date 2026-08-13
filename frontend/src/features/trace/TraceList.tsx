import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listTraces } from '../../api/traces.api';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';

export function TraceList() {
  const { data: traces = [], isLoading, error } = useQuery({
    queryKey: ['traces'],
    queryFn: listTraces,
    retry: false,
  });

  const [dateFilter, setDateFilter] = useState('all'); // all, today, yesterday, week, month, custom
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const filteredTraces = useMemo(() => {
    if (!traces) return [];
    const now = new Date();
    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const start = startOfDay(now);
    return traces
      .filter((trace) => {
        const ts = new Date(trace.timestamp ?? trace.created_at ?? '');
        // Date filter logic
        let passDate = true;
        if (dateFilter !== 'all') {
          const diff = now.getTime() - ts.getTime();
          switch (dateFilter) {
            case 'today':
              passDate = ts >= start;
              break;
            case 'yesterday': {
              const yesterdayStart = new Date(start);
              yesterdayStart.setDate(start.getDate() - 1);
              const yesterdayEnd = new Date(start);
              passDate = ts >= yesterdayStart && ts < yesterdayEnd;
              break;
            }
            case 'week':
              passDate = diff <= 7 * 24 * 60 * 60 * 1000;
              break;
            case 'month':
              passDate = diff <= 30 * 24 * 60 * 60 * 1000;
              break;
            case 'custom':
              if (customStart && customEnd) {
                const startDate = new Date(customStart);
                const endDate = new Date(customEnd);
                // Enforce max 3 months (≈90 days)
                const maxDiff = 90 * 24 * 60 * 60 * 1000;
                if (endDate.getTime() - startDate.getTime() > maxDiff) return false;
                if (endDate > now) return false;
                passDate = ts >= startDate && ts <= endDate;
              }
              break;
          }
        }
        return passDate;
      })
      .sort((a, b) => {
        // Fallback to first event's timestamp if trace itself lacks one
        const at = new Date(a.timestamp ?? a.created_at ?? (a.events && a.events.length ? a.events[0].timestamp : '')).getTime();
        const bt = new Date(b.timestamp ?? b.created_at ?? (b.events && b.events.length ? b.events[0].timestamp : '')).getTime();
        return bt - at; // descending newest first
      });
  }, [traces, dateFilter, customStart, customEnd]);

  if (isLoading) return <Card>Loading traces...</Card>;
  if (error) return <Card className="border-red-500 text-red-200">{(error as any).message}</Card>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center">
        <Select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} label="Date" className="w-48">
          <option value="all">All</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="week">Last 7 days</option>
          <option value="month">Last 30 days</option>
          <option value="custom">Custom</option>
        </Select>
        {dateFilter === 'custom' && (
          <div className="flex items-center gap-2">
            <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="rounded p-1 bg-gray-800 text-white" />
            <span>to</span>
            <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="rounded p-1 bg-gray-800 text-white" />
          </div>
        )}
      </div>
      <Card>
        <table className="w-full table-auto">
          <thead className="bg-gray-800/50">
            <tr>
              <th className="p-2 text-left">Trace ID</th>
              <th className="p-2 text-left">When</th>
              <th className="p-2 text-left">Exact Time</th>
              <th className="p-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTraces.map((trace) => (
              <tr key={trace.trace_id} className="border-b border-gray-700/30">
                <td className="p-2 font-mono text-sm break-all">{trace.trace_id}</td>
                <td className="p-2 time-ago">
                  {(() => {
                    const dateVal = new Date(trace.timestamp ?? trace.created_at ?? (trace.events && trace.events.length ? trace.events[0].timestamp : ''));
                    return isNaN(dateVal.getTime())
                      ? '—'
                      : formatDistanceToNow(dateVal, { addSuffix: true });
                  })()}
                </td>
                <td className="p-2 text-sm text-gray-400">
                  {(() => {
                     const dateVal = new Date(trace.timestamp ?? trace.created_at ?? (trace.events && trace.events.length ? trace.events[0].timestamp : ''));
                     return isNaN(dateVal.getTime()) ? 'Invalid Date' : dateVal.toLocaleString();
                  })()}
                </td>
                <td className="p-2">
                  <Link to={`/traces/${trace.trace_id}`} className="text-primary hover:underline">
                    View details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTraces.length === 0 && <p className="p-4 text-center text-gray-500">No traces match the selected filters.</p>}
      </Card>
    </div>
  );
}
