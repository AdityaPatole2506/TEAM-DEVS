import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle, AlertCircle, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { applicantApi } from '../../services/api';

const STATUS_STEPS = [
  'SUBMITTED', 'DOCUMENTS_VERIFIED', 'ELIGIBILITY_CHECKED',
  'COURSE_ASSIGNED', 'UNDER_REVIEW', 'APPROVED',
];

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: 'Application Submitted',
  DOCUMENTS_VERIFIED: 'Documents Verified',
  ELIGIBILITY_CHECKED: 'Eligibility Checked',
  COURSE_ASSIGNED: 'Course / Program Assigned',
  UNDER_REVIEW: 'Under Final Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: 'badge-blue',
  DOCUMENTS_VERIFIED: 'badge-green',
  ELIGIBILITY_CHECKED: 'badge-green',
  COURSE_ASSIGNED: 'badge-blue',
  UNDER_REVIEW: 'badge-yellow',
  APPROVED: 'badge-green',
  REJECTED: 'badge-red',
};

export default function MyApplications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    applicantApi.getApplications()
      .then(r => setApplications(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="section-title">My Applications</h1>
        <p className="section-subtitle">Track all your application statuses</p>
      </div>

      {applications.length === 0 ? (
        <div className="card text-center py-12">
          <FileText size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No applications yet</p>
          <p className="text-gray-400 text-sm mt-1">Enroll in a course to create an application</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app, idx) => {
            const currentStepIdx = app.status === 'REJECTED' ? -1 : STATUS_STEPS.indexOf(app.status);
            const isExpanded = expanded === app.id;

            return (
              <motion.div key={app.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-800">{app.program || app.applicationType}</span>
                      <span className={`badge ${STATUS_COLORS[app.status] || 'badge-gray'}`}>{STATUS_LABELS[app.status] || app.status}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      ID: {app.applicationId.slice(0, 8)}... · Submitted: {new Date(app.submittedAt).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                  <button onClick={() => setExpanded(isExpanded ? null : app.id)}
                    className="text-gray-400 hover:text-gray-600 ml-2 flex-shrink-0">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>

                {/* Progress bar */}
                {app.status !== 'REJECTED' && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{Math.round(((currentStepIdx + 1) / STATUS_STEPS.length) * 100)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill bg-blue-600"
                        style={{ width: `${((currentStepIdx + 1) / STATUS_STEPS.length) * 100}%` }} />
                    </div>
                  </div>
                )}

                {/* Timeline */}
                {isExpanded && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6">
                    <div className="text-sm font-medium text-gray-700 mb-4">Application Timeline</div>
                    <div className="space-y-0">
                      {STATUS_STEPS.map((status, i) => {
                        const historyItem = app.statusHistory?.find((h: any) => h.status === status);
                        const isDone = currentStepIdx >= i && app.status !== 'REJECTED';
                        const isCurrent = currentStepIdx === i;

                        return (
                          <div key={status} className="relative flex items-start gap-4 pb-6 last:pb-0 timeline-item">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                              isDone ? 'bg-green-500' : isCurrent ? 'bg-blue-500' : 'bg-gray-200'
                            }`}>
                              {isDone ? <CheckCircle size={16} className="text-white" /> : <Clock size={14} className={isCurrent ? 'text-white' : 'text-gray-400'} />}
                            </div>
                            <div className="pt-1">
                              <div className={`text-sm font-medium ${isDone ? 'text-gray-800' : 'text-gray-400'}`}>
                                {STATUS_LABELS[status]}
                              </div>
                              {historyItem?.updatedAt && (
                                <div className="text-xs text-gray-400 mt-0.5">
                                  {new Date(historyItem.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </div>
                              )}
                              {historyItem?.remarks && (
                                <div className="text-xs text-gray-500 mt-0.5">{historyItem.remarks}</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {app.status === 'REJECTED' && (
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                            <AlertCircle size={16} className="text-white" />
                          </div>
                          <div className="pt-1">
                            <div className="text-sm font-medium text-red-600">Application Rejected</div>
                            {app.remarks && <div className="text-xs text-gray-500 mt-0.5">{app.remarks}</div>}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
