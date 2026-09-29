import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, CheckCircle, Clock, XCircle, Search,
  Filter, Check, X, AlertTriangle, Fingerprint,
  FileCheck, CreditCard, Building2, User
} from 'lucide-react';
import { officialApi } from '../../services/api';
import toast from 'react-hot-toast';

interface VerificationItem {
  id: string;
  applicantId: string;
  type: string; // IDENTITY, BIOMETRIC, EPFO, TAX_GST, COURSE
  status: string; // PENDING, VERIFIED, REJECTED, NOT_AVAILABLE
  verifiedAt?: string;
  remarks?: string;
  createdAt: string;
  applicant: {
    id: string;
    fullName: string;
    applicantId: string;
    location?: string;
    user: { email: string };
  };
}

const TYPE_META: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  IDENTITY: { label: 'Aadhaar / Identity', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
  BIOMETRIC: { label: 'Biometric Verification', icon: Fingerprint, color: 'text-purple-600', bg: 'bg-purple-50' },
  EPFO: { label: 'EPFO Employment Status', icon: Building2, color: 'text-amber-600', bg: 'bg-amber-50' },
  TAX_GST: { label: 'Income Tax / GST Filing', icon: FileCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  COURSE: { label: 'Prior Course Credentials', icon: ShieldCheck, color: 'text-teal-600', bg: 'bg-teal-50' },
};

export default function Verification() {
  const [verifications, setVerifications] = useState<VerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeAction, setActiveAction] = useState<{ item: VerificationItem; nextStatus: 'VERIFIED' | 'REJECTED' } | null>(null);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchVerifications();
  }, [typeFilter, statusFilter]);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (typeFilter !== 'ALL') params.type = typeFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const res = await officialApi.getVerifications(params);
      setVerifications(res.data.data || []);
    } catch {
      toast.error('Failed to load verification queue');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!activeAction) return;
    setSubmitting(true);
    try {
      await officialApi.updateVerificationStatus(activeAction.item.id, {
        status: activeAction.nextStatus,
        remarks: remarks || `Marked as ${activeAction.nextStatus} by Official`,
      });
      toast.success(`${activeAction.item.type} verification ${activeAction.nextStatus.toLowerCase()} successfully`);
      setActiveAction(null);
      setRemarks('');
      fetchVerifications();
    } catch {
      toast.error('Failed to update verification status');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = verifications.filter(v => {
    const q = search.toLowerCase();
    return (
      v.applicant.fullName.toLowerCase().includes(q) ||
      v.applicant.applicantId.toLowerCase().includes(q) ||
      v.applicant.user.email.toLowerCase().includes(q)
    );
  });

  const pendingCount = verifications.filter(v => v.status === 'PENDING').length;
  const verifiedCount = verifications.filter(v => v.status === 'VERIFIED').length;
  const rejectedCount = verifications.filter(v => v.status === 'REJECTED').length;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          <ShieldCheck size={14} /> Official Compliance & Verification Desk
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Verification Management Queue</h1>
        <p className="text-gray-500 text-sm">
          Validate citizen identities, biometric scans, EPFO credentials and statutory records
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-amber-700 uppercase tracking-wide">Pending Review</div>
            <div className="text-2xl font-bold text-amber-900 mt-1">{pendingCount}</div>
            <div className="text-xs text-amber-600 mt-0.5">Requires official action</div>
          </div>
          <div className="p-3 bg-amber-100 rounded-xl text-amber-700">
            <Clock size={24} />
          </div>
        </div>

        <div className="bg-green-50/70 border border-green-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-green-700 uppercase tracking-wide">Verified & Active</div>
            <div className="text-2xl font-bold text-green-900 mt-1">{verifiedCount}</div>
            <div className="text-xs text-green-600 mt-0.5">Successfully authenticated</div>
          </div>
          <div className="p-3 bg-green-100 rounded-xl text-green-700">
            <CheckCircle size={24} />
          </div>
        </div>

        <div className="bg-red-50/70 border border-red-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-red-700 uppercase tracking-wide">Rejected / Disputed</div>
            <div className="text-2xl font-bold text-red-900 mt-1">{rejectedCount}</div>
            <div className="text-xs text-red-600 mt-0.5">Discrepancies flagged</div>
          </div>
          <div className="p-3 bg-red-100 rounded-xl text-red-700">
            <XCircle size={24} />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
          <input
            type="text"
            placeholder="Search applicant name, email, ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10 py-2 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mr-1">
            <Filter size={14} /> Type:
          </div>
          {['ALL', 'IDENTITY', 'BIOMETRIC', 'EPFO', 'TAX_GST'].map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                typeFilter === t
                  ? 'bg-blue-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t === 'ALL' ? 'All Types' : t.replace(/_/g, ' ')}
            </button>
          ))}

          <div className="h-4 w-px bg-gray-200 mx-1 hidden sm:block"></div>

          {['ALL', 'PENDING', 'VERIFIED', 'REJECTED'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mx-auto"></div>
            <p className="text-gray-400 text-sm mt-3">Loading verification queue...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <ShieldCheck size={40} className="mx-auto text-gray-300 mb-2" />
            <p className="font-medium text-gray-600">No verifications found</p>
            <p className="text-xs text-gray-400 mt-1">Adjust your filters to see more records</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Applicant</th>
                  <th className="px-5 py-3.5">Verification Category</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Submitted / Verified Date</th>
                  <th className="px-5 py-3.5">Official Remarks</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(item => {
                  const meta = TYPE_META[item.type] || {
                    label: item.type,
                    icon: ShieldCheck,
                    color: 'text-gray-700',
                    bg: 'bg-gray-100',
                  };
                  const Icon = meta.icon;

                  return (
                    <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-900">{item.applicant.fullName}</div>
                        <div className="text-xs font-mono text-blue-600">{item.applicant.applicantId}</div>
                        <div className="text-xs text-gray-400">{item.applicant.user.email}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium ${meta.bg} ${meta.color}`}>
                          <Icon size={14} />
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {item.status === 'VERIFIED' && (
                          <span className="badge-green">
                            <CheckCircle size={12} className="mr-1" /> Verified
                          </span>
                        )}
                        {item.status === 'PENDING' && (
                          <span className="badge-yellow">
                            <Clock size={12} className="mr-1" /> Pending
                          </span>
                        )}
                        {item.status === 'REJECTED' && (
                          <span className="badge-red">
                            <XCircle size={12} className="mr-1" /> Rejected
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500">
                        <div>
                          {item.verifiedAt ? (
                            <span className="text-green-700 font-medium">
                              Verified: {new Date(item.verifiedAt).toLocaleDateString('en-IN')}
                            </span>
                          ) : (
                            <span>Created: {new Date(item.createdAt).toLocaleDateString('en-IN')}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500 max-w-xs truncate">
                        {item.remarks || '—'}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.status !== 'VERIFIED' && (
                            <button
                              onClick={() => setActiveAction({ item, nextStatus: 'VERIFIED' })}
                              className="px-2.5 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                              title="Mark Verified"
                            >
                              <Check size={13} /> Verify
                            </button>
                          )}
                          {item.status !== 'REJECTED' && (
                            <button
                              onClick={() => setActiveAction({ item, nextStatus: 'REJECTED' })}
                              className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                              title="Reject Verification"
                            >
                              <X size={13} /> Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {activeAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${activeAction.nextStatus === 'VERIFIED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {activeAction.nextStatus === 'VERIFIED' ? <CheckCircle size={22} /> : <AlertTriangle size={22} />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Confirm {activeAction.nextStatus === 'VERIFIED' ? 'Verification Approval' : 'Rejection'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {activeAction.item.applicant.fullName} ({activeAction.item.type})
                  </p>
                </div>
              </div>

              <div>
                <label className="label text-xs">Official Remarks / Audit Notes</label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="e.g. Identity documents cross-checked with UIDAI database successfully."
                  className="input-field text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setActiveAction(null); setRemarks(''); }}
                  className="px-4 py-2 border rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleStatusUpdate}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all ${
                    activeAction.nextStatus === 'VERIFIED'
                      ? 'bg-green-700 hover:bg-green-800'
                      : 'bg-red-700 hover:bg-red-800'
                  }`}
                >
                  {submitting ? 'Processing...' : `Confirm ${activeAction.nextStatus}`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
