import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileSearch, Search, ChevronDown, ChevronUp, Eye, Clock } from 'lucide-react';
import { officialApi } from '../../services/api';

const STATUS_COLORS: Record<string, string> = {
  VERIFIED: 'badge-green',
  PENDING: 'badge-yellow',
  REJECTED: 'badge-red',
  NOT_AVAILABLE: 'badge-gray',
};

export default function Trackers() {
  const [trackers, setTrackers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    officialApi.getTrackers()
      .then(r => { setTrackers(r.data.data.trackers); setTotal(r.data.data.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>;

  const filtered = trackers.filter(t =>
    !search || t.applicant?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    t.designation?.toLowerCase().includes(search.toLowerCase()) ||
    t.governmentId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="section-title">Trackers</h1>
          <p className="section-subtitle">Applicant verification and credential tracking ({total} records)</p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search trackers..."
            className="input-field pl-9 w-60" />
        </div>
      </div>

      {/* Roles legend */}
      <div className="card">
        <h2 className="font-semibold text-gray-700 text-sm mb-3">Roles Module — Official Record Fields</h2>
        <div className="grid sm:grid-cols-5 gap-2 text-xs">
          {['Designation + Name', 'Update Logs Timestamp', 'Gov. ID / Credentials', 'EPFO Login Status', 'Income Tax / GST'].map(f => (
            <div key={f} className="bg-gray-50 rounded-lg p-2 text-center text-gray-600 font-medium">{f}</div>
          ))}
        </div>
      </div>

      {/* Tracker table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Applicant', 'Designation', 'Gov. ID', 'Last Updated', 'EPFO', 'Tax/GST', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400">No trackers found</td></tr>
              ) : filtered.map((tracker, i) => (
                <React.Fragment key={tracker.id}>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{tracker.applicant?.fullName || '—'}</div>
                      <div className="text-xs text-gray-400">{tracker.applicant?.applicantId}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{tracker.designation || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs font-mono">{tracker.governmentId || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      <div className="flex items-center gap-1"><Clock size={11} />{new Date(tracker.lastUpdated).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                    </td>
                    <td className="px-4 py-3"><span className={`badge ${STATUS_COLORS[tracker.epfoStatus] || 'badge-gray'}`}>{tracker.epfoStatus}</span></td>
                    <td className="px-4 py-3"><span className={`badge ${STATUS_COLORS[tracker.taxGstStatus] || 'badge-gray'}`}>{tracker.taxGstStatus}</span></td>
                    <td className="px-4 py-3"><span className={`badge ${tracker.credentialStatus === 'Active' ? 'badge-green' : 'badge-yellow'}`}>{tracker.credentialStatus || 'Pending'}</span></td>
                    <td className="px-4 py-3">
                      <button onClick={() => setExpanded(expanded === tracker.id ? null : tracker.id)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium">
                        <Eye size={13} /> {expanded === tracker.id ? 'Hide' : 'View'}
                      </button>
                    </td>
                  </tr>
                  {expanded === tracker.id && (
                    <tr>
                      <td colSpan={8} className="px-4 pb-4 bg-blue-50/50">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid sm:grid-cols-2 gap-4 pt-3">
                          <div>
                            <div className="text-xs text-gray-400 font-medium mb-2">Applicant Details</div>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between"><span className="text-gray-500">Email:</span><span>{tracker.applicant?.user?.email || '—'}</span></div>
                              <div className="flex justify-between"><span className="text-gray-500">Location:</span><span>{tracker.applicant?.location || '—'}</span></div>
                              <div className="flex justify-between"><span className="text-gray-500">Verification:</span><span className={`badge ${STATUS_COLORS[tracker.applicant?.verificationStatus] || 'badge-gray'}`}>{tracker.applicant?.verificationStatus}</span></div>
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400 font-medium mb-2">Tracker Notes</div>
                            <div className="text-sm text-gray-600 bg-white rounded-lg p-3 min-h-12">{tracker.notes || 'No notes added.'}</div>
                          </div>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
