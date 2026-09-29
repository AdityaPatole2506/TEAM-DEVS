import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, ShieldCheck, CheckCircle, BookOpen, BarChart3, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { officialApi } from '../../services/api';

export default function OfficialDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    officialApi.getDashboard().then(r => setData(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-4">{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
  );

  const stats = data?.stats;
  const CARDS = [
    { label: 'Total Applicants', value: stats?.totalApplicants || 0, icon: Users, color: 'bg-blue-500', bg: 'bg-blue-50 text-blue-700' },
    { label: 'Active Applications', value: stats?.activeApplications || 0, icon: FileText, color: 'bg-orange-500', bg: 'bg-orange-50 text-orange-700' },
    { label: 'Pending Verification', value: stats?.pendingVerification || 0, icon: Clock, color: 'bg-yellow-500', bg: 'bg-yellow-50 text-yellow-700' },
    { label: 'Completed', value: stats?.completedApplications || 0, icon: CheckCircle, color: 'bg-green-500', bg: 'bg-green-50 text-green-700' },
    { label: 'Enrolled Applicants', value: stats?.enrolledApplicants || 0, icon: BookOpen, color: 'bg-purple-500', bg: 'bg-purple-50 text-purple-700' },
    { label: 'Skill Gaps Detected', value: stats?.skillGapsDetected?.toLocaleString() || 0, icon: BarChart3, color: 'bg-indigo-500', bg: 'bg-indigo-50 text-indigo-700' },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="bg-gradient-to-r from-gray-800 to-blue-950 rounded-2xl p-6 text-white">
        <h1 className="text-xl font-bold mb-1">Government Official Dashboard</h1>
        <p className="text-gray-300 text-sm">Overview of applicant registrations, verifications, and skill gap data.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {CARDS.map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="card flex items-center gap-4">
            <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon size={22} className="text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{value.toLocaleString?.() || value}</div>
              <div className="text-xs text-gray-500 font-medium">{label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent applicants */}
      {data?.recentApplicants?.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">Recent Applicants</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-gray-400 font-medium">Name</th>
                  <th className="text-left py-2 text-gray-400 font-medium">ID</th>
                  <th className="text-left py-2 text-gray-400 font-medium">Email</th>
                  <th className="text-left py-2 text-gray-400 font-medium">Verification</th>
                  <th className="text-left py-2 text-gray-400 font-medium">Registered</th>
                </tr>
              </thead>
              <tbody>
                {data.recentApplicants.map((a: any) => (
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-800">{a.fullName}</td>
                    <td className="py-3 text-gray-500 text-xs font-mono">{a.applicantId}</td>
                    <td className="py-3 text-gray-500">{a.user?.email}</td>
                    <td className="py-3">
                      <span className={`badge ${a.verificationStatus === 'VERIFIED' ? 'badge-green' : a.verificationStatus === 'REJECTED' ? 'badge-red' : 'badge-yellow'}`}>
                        {a.verificationStatus}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400 text-xs">{new Date(a.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
