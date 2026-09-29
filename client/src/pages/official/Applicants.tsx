import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Eye, MapPin, ShieldCheck, Phone,
  Mail, Calendar, BookOpen, Award, CheckCircle, Clock,
  XCircle, X, ExternalLink, Building
} from 'lucide-react';
import { officialApi } from '../../services/api';
import toast from 'react-hot-toast';

const VER_COLORS: Record<string, string> = {
  VERIFIED: 'badge-green',
  PENDING: 'badge-yellow',
  REJECTED: 'badge-red',
  NOT_AVAILABLE: 'badge-gray',
};

export default function Applicants() {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = () => {
    setLoading(true);
    officialApi.getApplicants()
      .then(r => {
        setApplicants(r.data.data.applicants || []);
        setTotal(r.data.data.total || 0);
      })
      .catch(() => toast.error('Failed to load applicants'))
      .finally(() => setLoading(false));
  };

  const handleViewApplicant = async (id: string) => {
    setLoadingDetails(true);
    try {
      const res = await officialApi.getApplicantById(id);
      setSelectedApplicant(res.data.data);
    } catch {
      toast.error('Failed to load applicant profile');
    } finally {
      setLoadingDetails(false);
    }
  };

  const filtered = applicants.filter(a => {
    const matchSearch = !search ||
      a.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      a.applicantId?.toLowerCase().includes(search.toLowerCase()) ||
      a.user?.email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = !filter || a.verificationStatus === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <Users size={14} /> State Citizen Registry
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Registered Applicants</h1>
          <p className="text-gray-500 text-sm">Review applicant profiles, qualifications, and verification status ({total} citizens)</p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, ID, email..."
              className="input-field pl-9 py-2 text-sm w-60"
            />
          </div>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="input-field py-2 text-sm w-44"
          >
            <option value="">All Verification</option>
            <option value="VERIFIED">Verified</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mx-auto"></div>
            <p className="text-gray-400 text-sm mt-3">Loading citizen registry...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3.5">Applicant</th>
                  <th className="px-4 py-3.5">Applicant ID</th>
                  <th className="px-4 py-3.5">District / City</th>
                  <th className="px-4 py-3.5">Program / Course</th>
                  <th className="px-4 py-3.5">Verification</th>
                  <th className="px-4 py-3.5">Profile %</th>
                  <th className="px-4 py-3.5">Registered</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400">
                      No matching applicants found
                    </td>
                  </tr>
                ) : (
                  filtered.map((a, i) => (
                    <motion.tr
                      key={a.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-blue-50/20 transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-700 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {a.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{a.fullName}</div>
                            <div className="text-xs text-gray-400">{a.user?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs font-mono text-blue-700 font-medium">
                        {a.applicantId}
                      </td>
                      <td className="px-4 py-3.5 text-gray-600 text-xs">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-gray-400" />
                          {a.location || 'Maharashtra'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-700">
                        {a.enrollments?.[0]?.course?.name || a.applications?.[0]?.program || '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`badge ${VER_COLORS[a.verificationStatus] || 'badge-gray'}`}>
                          {a.verificationStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 progress-bar">
                            <div className="progress-fill bg-blue-600" style={{ width: `${a.profileCompletion || 0}%` }} />
                          </div>
                          <span className="text-xs text-gray-600 font-semibold">{a.profileCompletion || 0}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(a.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => handleViewApplicant(a.id)}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto transition-colors"
                        >
                          <Eye size={13} /> View
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detailed Profile Modal */}
      <AnimatePresence>
        {selectedApplicant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-700 rounded-2xl flex items-center justify-center text-white text-base font-bold shadow-md">
                    {selectedApplicant.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{selectedApplicant.fullName}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                      <span>{selectedApplicant.applicantId}</span> • <span>{selectedApplicant.user?.email}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedApplicant(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-xl text-xs">
                <div><span className="text-gray-400 block">Mobile</span><strong className="text-gray-800">{selectedApplicant.mobile || '—'}</strong></div>
                <div><span className="text-gray-400 block">Location</span><strong className="text-gray-800">{selectedApplicant.location || 'Maharashtra'}</strong></div>
                <div><span className="text-gray-400 block">Aadhaar (Masked)</span><strong className="text-gray-800 font-mono">{selectedApplicant.maskedAadhaar || 'XXXX-XXXX-1234'}</strong></div>
                <div><span className="text-gray-400 block">Biometric Verified</span><strong className={selectedApplicant.biometricVerified ? 'text-green-700' : 'text-amber-700'}>{selectedApplicant.biometricVerified ? 'Yes' : 'Pending'}</strong></div>
                <div><span className="text-gray-400 block">Verification Status</span><span className={`badge ${VER_COLORS[selectedApplicant.verificationStatus]}`}>{selectedApplicant.verificationStatus}</span></div>
                <div><span className="text-gray-400 block">Profile Complete</span><strong className="text-blue-700">{selectedApplicant.profileCompletion}%</strong></div>
              </div>

              {/* Education */}
              <div>
                <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2 flex items-center gap-1.5">
                  <BookOpen size={14} /> Educational Background
                </h4>
                {selectedApplicant.education && selectedApplicant.education.length > 0 ? (
                  <div className="space-y-2">
                    {selectedApplicant.education.map((ed: any, idx: number) => (
                      <div key={idx} className="p-3 border rounded-xl text-xs bg-white">
                        <div className="font-bold text-gray-900">{ed.qualification} in {ed.course}</div>
                        <div className="text-gray-500">{ed.institution} {ed.graduationYear ? `(${ed.graduationYear})` : ''}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400">No education records provided</div>
                )}
              </div>

              {/* Skills */}
              <div>
                <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2 flex items-center gap-1.5">
                  <Award size={14} /> Candidate Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedApplicant.applicantSkills?.map((s: any) => (
                    <span key={s.id} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                      {s.skill?.name || s.name} ({s.level})
                    </span>
                  ))}
                </div>
              </div>

              {/* Compliance Tracker */}
              {selectedApplicant.tracker && (
                <div className="border-t pt-3">
                  <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2 flex items-center gap-1.5">
                    <ShieldCheck size={14} /> Official Statutory Tracker Records
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs bg-blue-50/50 p-3 rounded-xl">
                    <div><span className="text-gray-500">Government ID:</span> <strong className="font-mono text-gray-800">{selectedApplicant.tracker.governmentId}</strong></div>
                    <div><span className="text-gray-500">Designation:</span> <strong className="text-gray-800">{selectedApplicant.tracker.designation || 'Candidate'}</strong></div>
                    <div><span className="text-gray-500">EPFO Status:</span> <strong className="text-gray-800">{selectedApplicant.tracker.epfoStatus}</strong></div>
                    <div><span className="text-gray-500">Income Tax / GST:</span> <strong className="text-gray-800">{selectedApplicant.tracker.taxGstStatus}</strong></div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedApplicant(null)}
                  className="btn-primary text-xs py-2 px-5"
                >
                  Close Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
