import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert, Users, Server, Database, Activity,
  CheckCircle, XCircle, Search, Filter, RefreshCw,
  Power, UserCheck, UserX, AlertTriangle, Building, Eye
} from 'lucide-react';
import { adminApi, officialApi } from '../../services/api';
import toast from 'react-hot-toast';

interface AdminStats {
  totalUsers: number;
  applicants: number;
  officials: number;
  admins: number;
  courses: number;
  applications: number;
}

interface UserItem {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  applicantProfile?: {
    fullName: string;
    applicantId: string;
  };
  governmentOfficial?: {
    fullName: string;
    officialId: string;
    designation: string;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [roleFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers(),
      ]);
      setStats(statsRes.data.data);
      let userList: UserItem[] = usersRes.data.data.users || [];
      if (roleFilter !== 'ALL') {
        userList = userList.filter(u => u.role === roleFilter);
      }
      setUsers(userList);
    } catch {
      toast.error('Failed to load admin telemetry');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (user: UserItem) => {
    setTogglingId(user.id);
    try {
      const res = await (adminApi as any).toggleActive?.(user.id) || 
        // direct axios call via adminApi or api
        (await import('../../services/api')).default.put(`/admin/users/${user.id}/toggle-active`);
      
      const newStatus = res.data.data.isActive;
      toast.success(`User ${user.email} is now ${newStatus ? 'Active' : 'Deactivated'}`);
      setUsers(users.map(u => u.id === user.id ? { ...u, isActive: newStatus } : u));
    } catch {
      toast.error('Failed to toggle user status');
    } finally {
      setTogglingId(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const q = search.toLowerCase();
    const name = u.applicantProfile?.fullName || u.governmentOfficial?.fullName || '';
    return u.email.toLowerCase().includes(q) || name.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 uppercase tracking-wider mb-1">
            <ShieldAlert size={14} /> Master Administration & Governance Console
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Control Center</h1>
          <p className="text-gray-500 text-sm">
            System-wide identity directory, role privileges, telemetry and infrastructure health
          </p>
        </div>

        <button
          onClick={loadData}
          className="btn-secondary flex items-center gap-2 text-sm shadow-sm self-start md:self-auto"
        >
          <RefreshCw size={15} /> Refresh Telemetry
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Accounts', val: stats?.totalUsers || 0, color: 'text-gray-900', bg: 'bg-white' },
          { label: 'Citizens', val: stats?.applicants || 0, color: 'text-blue-600', bg: 'bg-blue-50/60' },
          { label: 'Gov Officials', val: stats?.officials || 0, color: 'text-indigo-600', bg: 'bg-indigo-50/60' },
          { label: 'Sys Admins', val: stats?.admins || 0, color: 'text-purple-600', bg: 'bg-purple-50/60' },
          { label: 'Courses Active', val: stats?.courses || 0, color: 'text-teal-600', bg: 'bg-teal-50/60' },
          { label: 'Applications', val: stats?.applications || 0, color: 'text-emerald-600', bg: 'bg-emerald-50/60' },
        ].map((s, idx) => (
          <div key={idx} className={`${s.bg} rounded-2xl p-4 border border-gray-100 shadow-sm`}>
            <div className="text-[11px] text-gray-500 font-semibold uppercase">{s.label}</div>
            <div className={`text-2xl font-extrabold ${s.color} mt-1`}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Infrastructure Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-green-50 text-green-700 rounded-xl">
            <Server size={20} />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-900">API Gateway Status</div>
            <div className="text-xs text-green-600 font-medium flex items-center gap-1 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Operational (Port 5000)
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
            <Database size={20} />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-900">Primary Database Engine</div>
            <div className="text-xs text-blue-700 font-mono mt-0.5">SQLite / Prisma ORM Sync</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-700 rounded-xl">
            <Activity size={20} />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-900">Environment</div>
            <div className="text-xs text-purple-700 font-medium mt-0.5">Demo / SIH Prototype Sandbox</div>
          </div>
        </div>
      </div>

      {/* User Management Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Master User Directory & Security Controls</h2>
            <p className="text-xs text-gray-400">View registered accounts, toggle suspension, or reassign privileges</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                type="text"
                placeholder="Search email, name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field pl-9 py-1.5 text-xs"
              />
            </div>

            <div className="flex items-center gap-1 text-xs">
              {['ALL', 'APPLICANT', 'GOVERNMENT_OFFICIAL', 'ADMIN'].map(r => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    roleFilter === r
                      ? 'bg-rose-700 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {r === 'ALL' ? 'All Roles' : r.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">User & Contact</th>
                <th className="px-4 py-3">Assigned Name / ID</th>
                <th className="px-4 py-3">System Role</th>
                <th className="px-4 py-3">Created On</th>
                <th className="px-4 py-3">Account Status</th>
                <th className="px-4 py-3 text-right">Access Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map(user => {
                const name = user.applicantProfile?.fullName || user.governmentOfficial?.fullName || '—';
                const idTag = user.applicantProfile?.applicantId || user.governmentOfficial?.officialId || user.id.slice(0, 8);

                return (
                  <tr key={user.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">{user.email}</div>
                      <div className="text-[10px] text-gray-400 font-mono">UID: {user.id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-800 font-medium">{name}</div>
                      <div className="text-xs font-mono text-blue-600">{idTag}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'GOVERNMENT_OFFICIAL' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.isActive ? <CheckCircle size={11} /> : <XCircle size={11} />}
                        {user.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleToggleActive(user)}
                        disabled={togglingId === user.id}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1.5 ${
                          user.isActive
                            ? 'bg-red-50 text-red-700 hover:bg-red-100'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        <Power size={12} />
                        {user.isActive ? 'Deactivate' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
