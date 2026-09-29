import React, { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle, Clock, XCircle } from 'lucide-react';
import { applicantApi } from '../../services/api';

const TYPE_LABELS: Record<string, string> = {
  IDENTITY: 'Identity Verification (Demo Aadhaar)',
  BIOMETRIC: 'Biometric Demo Verification',
  COURSE: 'Course Verification',
  EPFO: 'EPFO Verification — Demo',
  TAX_GST: 'Income Tax / GST Verification — Demo',
};

const STATUS_CONFIG = {
  VERIFIED: { label: 'Verified', icon: CheckCircle, color: 'text-green-600 bg-green-50 border-green-200' },
  PENDING: { label: 'Pending', icon: Clock, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  REJECTED: { label: 'Rejected', icon: XCircle, color: 'text-red-600 bg-red-50 border-red-200' },
  NOT_AVAILABLE: { label: 'N/A', icon: Clock, color: 'text-gray-500 bg-gray-50 border-gray-200' },
};

export default function VerificationStatus() {
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applicantApi.getProfile()
      .then(r => setVerifications(r.data.data.verifications || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>;

  return (
    <div className="max-w-3xl space-y-6">
      <div><h1 className="section-title">Verification Status</h1><p className="section-subtitle">Track your document and identity verification</p></div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
        🎓 Demo Environment — All verifications are simulated. No real identity data is verified.
      </div>

      <div className="space-y-3">
        {verifications.length === 0 ? (
          <div className="card text-center py-8">
            <ShieldCheck size={40} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400">No verification records found</p>
          </div>
        ) : verifications.map((ver, i) => {
          const cfg = STATUS_CONFIG[ver.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;
          const Icon = cfg.icon;
          return (
            <div key={ver.id} className={`card border flex items-center justify-between ${cfg.color}`}>
              <div className="flex items-center gap-3">
                <Icon size={22} />
                <div>
                  <div className="font-semibold text-sm">{TYPE_LABELS[ver.type] || ver.type}</div>
                  {ver.verifiedAt && (
                    <div className="text-xs opacity-70">Verified: {new Date(ver.verifiedAt).toLocaleDateString('en-IN')}</div>
                  )}
                </div>
              </div>
              <span className="badge text-xs font-semibold">{cfg.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
