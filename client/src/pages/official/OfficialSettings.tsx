import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Shield, User, Bell, Lock,
  Save, Building, Check, Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function OfficialSettings() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.profile?.fullName || 'Rajendra Patil',
    email: user?.email || 'official@demo.com',
    designation: (user?.profile as any)?.designation || 'Senior Official',
    department: (user?.profile as any)?.department || 'Digital Services & Skill Development',
    officialId: (user?.profile as any)?.officialId || 'GOV1001',
    notifyEmail: true,
    notifySms: false,
    auditLogging: true,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    toast.success('Official preferences saved successfully');
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          <Settings size={14} /> Official Account & Portal Preferences
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Official Settings</h1>
        <p className="text-gray-500 text-sm">
          Manage your official designation, contact routing and system notification preferences
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <User size={18} className="text-blue-700" /> Official Identification & Department
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label text-xs">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                className="input-field text-sm"
              />
            </div>

            <div>
              <label className="label text-xs">Official Email Address</label>
              <input
                type="email"
                disabled
                value={formData.email}
                className="input-field text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="label text-xs">Government Official ID</label>
              <input
                type="text"
                disabled
                value={formData.officialId}
                className="input-field text-sm bg-gray-50 text-gray-500 font-mono cursor-not-allowed"
              />
            </div>

            <div>
              <label className="label text-xs">Designation / Role Title</label>
              <input
                type="text"
                value={formData.designation}
                onChange={e => setFormData({ ...formData, designation: e.target.value })}
                className="input-field text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="label text-xs">Department / Division</label>
              <input
                type="text"
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
                className="input-field text-sm"
              />
            </div>
          </div>
        </div>

        {/* Security & Audit notice */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <Shield size={18} className="text-indigo-700" /> Portal Compliance & Audit Policies
          </h3>

          <div className="space-y-3 text-xs text-gray-600">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <strong className="text-gray-900 block">Automatic Activity Auditing</strong>
                <span>All verification and status modifications are cryptographically timestamped.</span>
              </div>
              <span className="badge-green">Enforced</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <strong className="text-gray-900 block">Prototype & Demo Watermark</strong>
                <span>Explicit demo disclaimers are placed to prevent confusion with production government systems.</span>
              </div>
              <span className="badge-blue">Active</span>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button type="submit" className="btn-primary flex items-center gap-2 text-sm shadow-md">
            {saved ? <Check size={16} /> : <Save size={16} />}
            {saved ? 'Saved Successfully' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
}
