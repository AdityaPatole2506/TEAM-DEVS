import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Search, CheckCircle, XCircle, Clock,
  Filter, Eye, ChevronDown, Check, X,
  Building, User, Calendar, MessageSquare
} from 'lucide-react';
import { officialApi } from '../../services/api';
import toast from 'react-hot-toast';

interface ApplicationItem {
  id: string;
  applicationId: string;
  applicationType: string;
  program?: string;
  status: string;
  remarks?: string;
  submittedAt: string;
  applicant: {
    id: string;
    fullName: string;
    applicantId: string;
    mobile?: string;
    location?: string;
    user: { email: string };
  };
  statusHistory?: Array<{
    id: string;
    status: string;
    remarks?: string;
    updatedAt: string;
    updatedBy?: string;
  }>;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: any }> = {
  SUBMITTED: { label: 'Submitted', bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
  UNDER_REVIEW: { label: 'Under Review', bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock },
  DOCUMENTS_VERIFIED: { label: 'Docs Verified', bg: 'bg-purple-100', text: 'text-purple-700', icon: CheckCircle },
  ELIGIBILITY_CHECKED: { label: 'Eligibility Checked', bg: 'bg-indigo-100', text: 'text-indigo-700', icon: CheckCircle },
  COURSE_ASSIGNED: { label: 'Course Assigned', bg: 'bg-teal-100', text: 'text-teal-700', icon: CheckCircle },
  APPROVED: { label: 'Approved', bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
  REJECTED: { label: 'Rejected', bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
};

export default function OfficialApplications() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);
  const [actionModal, setActionModal] = useState<{ app: ApplicationItem; nextStatus: string } | null>(null);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const res = await officialApi.getApplications(params);
      setApplications(res.data.data.applications || []);
    } catch {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!actionModal) return;
    setSubmitting(true);
    try {
      await officialApi.updateApplicationStatus(actionModal.app.id, {
        status: actionModal.nextStatus,
        remarks: remarks || `Status updated to ${actionModal.nextStatus}`,
      });
      toast.success(`Application marked as ${actionModal.nextStatus.replace(/_/g, ' ')}`);
      setActionModal(null);
      setRemarks('');
      fetchApplications();
      if (selectedApp && selectedApp.id === actionModal.app.id) {
        setSelectedApp(null);
      }
    } catch {
      toast.error('Failed to update application');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = applications.filter(app => {
    const q = search.toLowerCase();
    return (
      app.applicationId.toLowerCase().includes(q) ||
      app.applicant.fullName.toLowerCase().includes(q) ||
      app.applicant.user.email.toLowerCase().includes(q) ||
      (app.program && app.program.toLowerCase().includes(q))
    );
  });

  const counts = {
    total: applications.length,
    submitted: applications.filter(a => a.status === 'SUBMITTED').length,
    inReview: applications.filter(a => a.status === 'UNDER_REVIEW' || a.status === 'DOCUMENTS_VERIFIED').length,
    approved: applications.filter(a => a.status === 'APPROVED').length,
    rejected: applications.filter(a => a.status === 'REJECTED').length,
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <Building size={14} /> Maharashtra State Portal Administration
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Application Management</h1>
          <p className="text-gray-500 text-sm">Review, verify and process citizen course & scheme applications</p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total', count: counts.total, color: 'text-gray-900', bg: 'bg-white' },
          { label: 'Submitted', count: counts.submitted, color: 'text-blue-600', bg: 'bg-blue-50/60' },
          { label: 'In Review', count: counts.inReview, color: 'text-amber-600', bg: 'bg-amber-50/60' },
          { label: 'Approved', count: counts.approved, color: 'text-green-600', bg: 'bg-green-50/60' },
          { label: 'Rejected', count: counts.rejected, color: 'text-red-600', bg: 'bg-red-50/60' },
        ].map((s, idx) => (
          <div key={idx} className={`${s.bg} rounded-xl p-3 border border-gray-100 shadow-sm`}>
            <div className="text-xs text-gray-500 font-medium">{s.label}</div>
            <div className={`text-xl font-bold ${s.color} mt-0.5`}>{s.count}</div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
          <input
            type="text"
            placeholder="Search by ID, applicant, or course..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10 py-2 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <Filter size={15} className="text-gray-400 shrink-0" />
          {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED', 'APPROVED', 'REJECTED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-blue-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st === 'ALL' ? 'All Applications' : st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mx-auto"></div>
            <p className="text-gray-400 text-sm mt-3">Loading applications...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <FileText size={40} className="mx-auto text-gray-300 mb-2" />
            <p className="font-medium text-gray-600">No applications match your filter</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Application ID</th>
                  <th className="px-5 py-3.5">Applicant Details</th>
                  <th className="px-5 py-3.5">Program / Scheme</th>
                  <th className="px-5 py-3.5">Submitted On</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(app => {
                  const statusConf = STATUS_CONFIG[app.status] || {
                    label: app.status,
                    bg: 'bg-gray-100',
                    text: 'text-gray-700',
                    icon: Clock,
                  };
                  const StatusIcon = statusConf.icon;

                  return (
                    <tr key={app.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-5 py-4 font-mono font-medium text-blue-700">
                        {app.applicationId}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-900">{app.applicant.fullName}</div>
                        <div className="text-xs text-gray-400">{app.applicant.user.email}</div>
                        {app.applicant.location && (
                          <div className="text-xs text-gray-500 mt-0.5">{app.applicant.location}</div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-medium text-gray-800">{app.program || 'General Enrollment'}</span>
                        <div className="text-xs text-gray-400">{app.applicationType.replace(/_/g, ' ')}</div>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500">
                        {new Date(app.submittedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusConf.bg} ${statusConf.text}`}>
                          <StatusIcon size={12} />
                          {statusConf.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="p-1.5 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Full Details"
                          >
                            <Eye size={16} />
                          </button>
                          {app.status !== 'APPROVED' && (
                            <button
                              onClick={() => setActionModal({ app, nextStatus: 'APPROVED' })}
                              className="px-2.5 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                              title="Approve Application"
                            >
                              <Check size={13} /> Approve
                            </button>
                          )}
                          {app.status !== 'REJECTED' && (
                            <button
                              onClick={() => setActionModal({ app, nextStatus: 'REJECTED' })}
                              className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                              title="Reject Application"
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

      {/* Details Modal */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <div className="text-xs font-mono text-blue-600 font-semibold">{selectedApp.applicationId}</div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedApp.program || 'Course Application'}</h3>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Applicant Card */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="text-xs text-gray-500 font-semibold uppercase">Applicant Information</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-gray-400">Name:</span> <strong className="text-gray-800">{selectedApp.applicant.fullName}</strong></div>
                  <div><span className="text-gray-400">Applicant ID:</span> <strong className="font-mono text-gray-800">{selectedApp.applicant.applicantId}</strong></div>
                  <div><span className="text-gray-400">Email:</span> <span className="text-gray-800">{selectedApp.applicant.user.email}</span></div>
                  <div><span className="text-gray-400">Location:</span> <span className="text-gray-800">{selectedApp.applicant.location || 'N/A'}</span></div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase mb-3">Processing Timeline</div>
                <div className="space-y-3">
                  {selectedApp.statusHistory && selectedApp.statusHistory.length > 0 ? (
                    selectedApp.statusHistory.map((hist, i) => (
                      <div key={i} className="flex gap-3 text-xs">
                        <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-600 shrink-0"></div>
                        <div>
                          <div className="font-semibold text-gray-800">{hist.status.replace(/_/g, ' ')}</div>
                          <div className="text-gray-500">{hist.remarks}</div>
                          <div className="text-gray-400 text-[10px] mt-0.5">
                            {new Date(hist.updatedAt).toLocaleString('en-IN')} {hist.updatedBy ? `• By ${hist.updatedBy}` : ''}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400">No previous status history logged</p>
                  )}
                </div>
              </div>

              {/* Quick Status Changers */}
              <div className="pt-2 border-t flex flex-wrap gap-2">
                <span className="text-xs font-medium text-gray-500 self-center mr-2">Update to:</span>
                {['UNDER_REVIEW', 'DOCUMENTS_VERIFIED', 'APPROVED', 'REJECTED'].map(st => (
                  <button
                    key={st}
                    onClick={() => setActionModal({ app: selectedApp, nextStatus: st })}
                    className="px-3 py-1 bg-gray-100 hover:bg-blue-100 hover:text-blue-700 text-gray-700 text-xs font-medium rounded-lg transition-colors"
                  >
                    {st.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Action Remark Modal */}
      <AnimatePresence>
        {actionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <h3 className="text-base font-bold text-gray-900">
                Update Status to: <span className="text-blue-700">{actionModal.nextStatus.replace(/_/g, ' ')}</span>
              </h3>
              <p className="text-xs text-gray-500">
                Application: <strong>{actionModal.app.applicationId}</strong> ({actionModal.app.applicant.fullName})
              </p>

              <div>
                <label className="label text-xs">Official Remarks / Comments</label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="e.g. All documents verified. Approved for batch 2026."
                  className="input-field text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setActionModal(null); setRemarks(''); }}
                  className="px-4 py-2 border rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleUpdateStatus}
                  className="btn-primary text-xs py-2 px-4"
                >
                  {submitting ? 'Updating...' : 'Confirm Update'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
