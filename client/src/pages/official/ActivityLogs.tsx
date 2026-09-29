import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, Search, Filter, Shield, Clock,
  User, Globe, Database, KeyRound
} from 'lucide-react';
import { officialApi } from '../../services/api';
import toast from 'react-hot-toast';

interface LogItem {
  id: string;
  action: string;
  resource?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
  user?: {
    email: string;
    role: string;
  };
}

const ACTION_COLORS: Record<string, { bg: string; text: string }> = {
  LOGIN: { bg: 'bg-green-100', text: 'text-green-700' },
  REGISTER: { bg: 'bg-blue-100', text: 'text-blue-700' },
  LOGOUT: { bg: 'bg-gray-100', text: 'text-gray-700' },
  UPDATE_PROFILE: { bg: 'bg-purple-100', text: 'text-purple-700' },
  ENROLL_COURSE: { bg: 'bg-teal-100', text: 'text-teal-700' },
  SUBMIT_APPLICATION: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  VERIFICATION: { bg: 'bg-amber-100', text: 'text-amber-700' },
  STATUS_CHANGE: { bg: 'bg-rose-100', text: 'text-rose-700' },
};

export default function ActivityLogs() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (actionFilter !== 'ALL') params.action = actionFilter;
      const res = await officialApi.getActivityLogs(params);
      setLogs(res.data.data.logs || []);
    } catch {
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter(log => {
    const q = search.toLowerCase();
    return (
      (log.user?.email && log.user.email.toLowerCase().includes(q)) ||
      log.action.toLowerCase().includes(q) ||
      (log.details && log.details.toLowerCase().includes(q)) ||
      (log.ipAddress && log.ipAddress.includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          <Shield size={14} /> Security Compliance & Audit Trail
        </div>
        <h1 className="text-2xl font-bold text-gray-900">System Activity Logs</h1>
        <p className="text-gray-500 text-sm">
          Immutable audit record of user logins, role modifications and verification events
        </p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
          <input
            type="text"
            placeholder="Search email, action, IP, or details..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10 py-2 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <Filter size={15} className="text-gray-400 shrink-0" />
          {['ALL', 'LOGIN', 'REGISTER', 'VERIFICATION', 'STATUS_CHANGE'].map(a => (
            <button
              key={a}
              onClick={() => setActionFilter(a)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                actionFilter === a
                  ? 'bg-blue-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {a === 'ALL' ? 'All Activities' : a.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mx-auto"></div>
            <p className="text-gray-400 text-sm mt-3">Loading audit records...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Activity size={40} className="mx-auto text-gray-300 mb-2" />
            <p className="font-medium text-gray-600">No activity logs recorded yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">Action</th>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Resource</th>
                  <th className="px-5 py-3.5">Details</th>
                  <th className="px-5 py-3.5">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(log => {
                  const actionStyle = ACTION_COLORS[log.action] || { bg: 'bg-gray-100', text: 'text-gray-700' };

                  return (
                    <tr key={log.id} className="hover:bg-gray-50/40">
                      <td className="px-5 py-3.5 text-xs text-gray-500 font-mono whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${actionStyle.bg} ${actionStyle.text}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-gray-800 text-xs">{log.user?.email || 'System'}</div>
                        {log.user?.role && (
                          <div className="text-[10px] text-gray-400">{log.user.role}</div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-600 font-medium">
                        {log.resource || '—'}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-500 max-w-sm truncate">
                        {log.details || '—'}
                      </td>
                      <td className="px-5 py-3.5 text-xs font-mono text-gray-400">
                        {log.ipAddress || '127.0.0.1'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
