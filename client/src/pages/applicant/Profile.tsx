import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Calendar, Edit3, Save, X, Plus, Trash2, ShieldCheck } from 'lucide-react';
import { applicantApi } from '../../services/api';
import toast from 'react-hot-toast';

export default function ApplicantProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await applicantApi.getProfile();
      setProfile(res.data.data);
      setForm(res.data.data);
    } catch { toast.error('Failed to load profile'); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await applicantApi.updateProfile({
        fullName: form.fullName,
        dob: form.dob,
        gender: form.gender,
        mobile: form.mobile,
        alternateMobile: form.alternateMobile,
        location: form.location,
        currentAddress: form.currentAddress,
        permanentAddress: form.permanentAddress,
      });
      toast.success('Profile updated successfully!');
      setEditMode(false);
      fetchProfile();
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
    </div>
  );

  const verStatus = profile?.verificationStatus || 'PENDING';
  const verConfig: Record<string, { label: string; color: string }> = {
    VERIFIED: { label: 'Verified', color: 'badge-green' },
    PENDING: { label: 'Pending', color: 'badge-yellow' },
    REJECTED: { label: 'Rejected', color: 'badge-red' },
    NOT_AVAILABLE: { label: 'N/A', color: 'badge-gray' },
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">My Profile</h1>
          <p className="section-subtitle">Manage your personal information</p>
        </div>
        {!editMode ? (
          <button onClick={() => setEditMode(true)} className="btn-primary flex items-center gap-2">
            <Edit3 size={16} /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => { setEditMode(false); setForm(profile); }} className="btn-secondary flex items-center gap-2">
              <X size={16} /> Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
              <Save size={16} /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {/* Profile card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-700 to-indigo-800 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
            {profile?.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{profile?.fullName}</h2>
            <p className="text-gray-500 text-sm">{profile?.user?.email || 'No email'}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`badge ${verConfig[verStatus]?.color}`}>
                <ShieldCheck size={12} className="mr-1" />
                {verConfig[verStatus]?.label}
              </span>
              <span className="badge badge-blue">ID: {profile?.applicantId}</span>
            </div>
          </div>
          <div className="ml-auto">
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-700">{profile?.profileCompletion || 0}%</div>
              <div className="text-xs text-gray-400">Complete</div>
            </div>
            <div className="w-24 mt-1 progress-bar">
              <div className="progress-fill bg-blue-600" style={{ width: `${profile?.profileCompletion || 0}%` }} />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
          {[
            { label: 'Full Name', key: 'fullName', icon: User, type: 'text' },
            { label: 'Date of Birth', key: 'dob', icon: Calendar, type: 'date' },
            { label: 'Gender', key: 'gender', icon: User, type: 'select', options: ['Male', 'Female', 'Other', 'Prefer not to say'] },
            { label: 'Mobile', key: 'mobile', icon: Phone, type: 'tel' },
            { label: 'Alternate Mobile', key: 'alternateMobile', icon: Phone, type: 'tel' },
            { label: 'Location', key: 'location', icon: MapPin, type: 'text' },
          ].map(({ label, key, icon: Icon, type, options }) => (
            <div key={key}>
              <label className="label flex items-center gap-1.5">
                <Icon size={13} className="text-gray-400" />
                {label}
              </label>
              {editMode ? (
                type === 'select' ? (
                  <select className="input-field" value={form[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })}>
                    <option value="">Select...</option>
                    {options?.map(o => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type={type} className="input-field" value={form[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })} />
                )
              ) : (
                <div className="text-gray-800 text-sm py-2.5 px-4 bg-gray-50 rounded-xl">
                  {key === 'dob' && profile[key] ? new Date(profile[key]).toLocaleDateString('en-IN') : profile[key] || '—'}
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Address */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <MapPin size={16} className="text-blue-600" /> Address
        </h3>
        <div className="space-y-4">
          {[
            { label: 'Current Address', key: 'currentAddress' },
            { label: 'Permanent Address', key: 'permanentAddress' },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="label">{label}</label>
              {editMode ? (
                <textarea className="input-field h-20 resize-none" value={form[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })} />
              ) : (
                <div className="text-gray-800 text-sm py-2.5 px-4 bg-gray-50 rounded-xl min-h-[44px]">{profile[key] || '—'}</div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Education */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card">
        <h3 className="font-semibold text-gray-800 mb-4">Education</h3>
        {profile?.education?.length > 0 ? (
          <div className="space-y-3">
            {profile.education.map((edu: any) => (
              <div key={edu.id} className="bg-gray-50 rounded-xl p-4">
                <div className="font-semibold text-gray-800">{edu.qualification}</div>
                <div className="text-gray-600 text-sm">{edu.institution}</div>
                <div className="text-gray-500 text-sm">{edu.course} {edu.specialization && `— ${edu.specialization}`}</div>
                {edu.graduationYear && <div className="text-xs text-gray-400 mt-1">Graduated: {edu.graduationYear}</div>}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-sm text-center py-4">No education details added yet</div>
        )}
      </motion.div>

      {/* Skills */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
        <h3 className="font-semibold text-gray-800 mb-4">Skills</h3>
        {profile?.applicantSkills?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profile.applicantSkills.map((s: any) => (
              <span key={s.id} className={`badge ${s.level === 'ADVANCED' || s.level === 'EXPERT' ? 'badge-green' : s.level === 'INTERMEDIATE' ? 'badge-blue' : 'badge-gray'}`}>
                {s.skill.name}
                <span className="ml-1 opacity-60 text-xs">· {s.level.charAt(0) + s.level.slice(1).toLowerCase()}</span>
              </span>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-sm text-center py-4">No skills added yet. Use AI Gap Analyzer to get recommendations.</div>
        )}
      </motion.div>

      {/* Verification */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card">
        <h3 className="font-semibold text-gray-800 mb-4">Verification Status</h3>
        <div className="space-y-3">
          {[
            { label: 'Identity Verification', key: 'IDENTITY' },
            { label: 'Biometric Demo Verification', key: 'BIOMETRIC' },
            { label: 'Course Verification', key: 'COURSE' },
          ].map(({ label, key }) => {
            const ver = profile?.verifications?.find((v: any) => v.type === key);
            const status = ver?.status || 'PENDING';
            return (
              <div key={key} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-600">{label}</span>
                <span className={`badge ${verConfig[status]?.color}`}>{verConfig[status]?.label}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 p-3 bg-amber-50 rounded-xl text-xs text-amber-700">
          🎓 This is a demo portal. Verification statuses are simulated.
        </div>
      </motion.div>
    </div>
  );
}
