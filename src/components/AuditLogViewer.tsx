import React, { useState, useEffect } from 'react';
import { AuditLog } from '../types';
import { Search, Filter, Calendar, User as UserIcon, Activity, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface AuditLogViewerProps {
  poolId?: string;
  global?: boolean;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ poolId, global = false }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    userId: '',
    startDate: '',
    endDate: ''
  });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (poolId) params.append('poolId', poolId);
      if (filters.action) params.append('action', filters.action);
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const res = await fetch(`/api/audit-logs?${params.toString()}`, {
        headers: { 'x-user-id': localStorage.getItem('nyaya_user') ? JSON.parse(localStorage.getItem('nyaya_user')!).id : '' }
      });
      if (res.ok) {
        setLogs(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [poolId, filters]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm flex flex-wrap gap-4 items-end">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-black/40">Action Type</label>
          <select 
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            className="px-4 py-2 rounded-xl border border-black/5 bg-gray-50 text-sm outline-none focus:border-emerald-600 transition-all"
          >
            <option value="">All Actions</option>
            <option value="POOL_CREATED">Pool Created</option>
            <option value="PROPOSAL_CREATED">Proposal Created</option>
            <option value="SUBSCRIPTION_UPDATED">Subscription Updated</option>
            <option value="REPUTATION_UPDATE">Reputation Update</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-black/40">User ID</label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-black/20" size={14} />
            <input 
              type="text"
              placeholder="Filter by user..."
              value={filters.userId}
              onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
              className="pl-9 pr-4 py-2 rounded-xl border border-black/5 bg-gray-50 text-sm outline-none focus:border-emerald-600 transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-black/40">Date Range</label>
          <div className="flex items-center gap-2">
            <input 
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="px-4 py-2 rounded-xl border border-black/5 bg-gray-50 text-sm outline-none focus:border-emerald-600 transition-all"
            />
            <span className="text-black/20">to</span>
            <input 
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="px-4 py-2 rounded-xl border border-black/5 bg-gray-50 text-sm outline-none focus:border-emerald-600 transition-all"
            />
          </div>
        </div>

        <button 
          onClick={fetchLogs}
          className="px-6 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-black/90 transition-all"
        >
          Refresh
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-black/5">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-black/40">Timestamp</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-black/40">Action</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-black/40">User</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-black/40">Details</th>
                {global && <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-black/40">Pool ID</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-black/40">Loading logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-black/40">No logs found matching filters.</td></tr>
              ) : logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-xs font-mono text-black/60">
                    <div className="flex items-center gap-2">
                      <Clock size={12} />
                      {format(new Date(log.timestamp), 'MMM d, HH:mm:ss')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">{log.userId}</td>
                  <td className="px-6 py-4 text-sm text-black/60">{log.details}</td>
                  {global && <td className="px-6 py-4 text-xs font-mono text-black/40">{log.poolId}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
