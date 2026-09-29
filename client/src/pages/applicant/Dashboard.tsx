import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, FileText, BookOpen, ShieldCheck, Brain, Bell,
  TrendingUp, CheckCircle, Clock, AlertCircle, ArrowRight,
  Award, Zap, BookMarked, RefreshCw
} from 'lucide-react';
import { applicantApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface DashboardData {
  profile: any;
  stats: {
    profileCompletion: number;
    applicationStatus: string;
    courseEnrolled: string;
    verificationStatus: string;
    gapAnalysisCount: number;
    totalApplications: number;
    totalEnrollments: number;
    unreadNotifications: number;
  };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  SUBMITTED: { label: 'Submitted', color: 'badge-blue', icon: Clock },
  DOCUMENTS_VERIFIED: { label: 'Docs Verified', color: 'badge-green', icon: CheckCircle },
  ELIGIBILITY_CHECKED: { label: 'Eligibility OK', color: 'badge-green', icon: CheckCircle },
  COURSE_ASSIGNED: { label: 'Course Assigned', color: 'badge-blue', icon: BookOpen },
  UNDER_REVIEW: { label: 'Under Review', color: 'badge-yellow', icon: Clock },
  APPROVED: { label: 'Approved', color: 'badge-green', icon: CheckCircle },
  REJECTED: { label: 'Rejected', color: 'badge-red', icon: AlertCircle },
  NONE: { label: 'No Application', color: 'badge-gray', icon: FileText },
};

const VER_CONFIG: Record<string, { label: string; color: string }> = {
  VERIFIED: { label: 'Verified', color: 'badge-green' },
  PENDING: { label: 'Pending', color: 'badge-yellow' },
  REJECTED: { label: 'Rejected', color: 'badge-red' },
  NOT_AVAILABLE: { label: 'N/A', color: 'badge-gray' },
};

function CircularProgress({ value, size = 100 }: { value: number; size?: number }) {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={value >= 80 ? '#16a34a' : value >= 60 ? '#2563eb' : '#f59e0b'}
        strokeWidth="8" strokeDasharray={`${dash} ${c}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s ease' }}
      />
    </svg>
  );
}

export default function ApplicantDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await applicantApi.getDashboard();
      setData(res.data.data);
    } catch (err: any) {
      setError('Failed to load dashboard. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center py-10">
        <AlertCircle size={40} className="text-red-400 mx-auto mb-3" />
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={fetchDashboard} className="btn-primary flex items-center gap-2 mx-auto">
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  const stats = data?.stats;
  const profile = data?.profile;
  const userName = profile?.fullName || user?.email || 'Applicant';
  const appStatusCfg = STATUS_CONFIG[stats?.applicationStatus || 'NONE'];
  const verCfg = VER_CONFIG[stats?.verificationStatus || 'PENDING'];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-2xl p-6 text-white"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold mb-1">Welcome back, {userName.split(' ')[0]}! 👋</h1>
            <p className="text-blue-200 text-sm">
              {stats?.profileCompletion && stats.profileCompletion < 80
                ? `Your profile is ${stats.profileCompletion}% complete. Add more details to improve visibility.`
                : 'Your profile is well set up. Explore AI Gap Analyzer for career insights!'}
            </p>
          </div>
          <button
            onClick={() => navigate('/applicant/ai-gap-analyzer')}
            className="flex items-center gap-2 bg-white text-blue-800 px-4 py-2.5 rounded-xl font-semibold hover:bg-blue-50 text-sm whitespace-nowrap self-start sm:self-auto"
          >
            <Zap size={16} />
            Analyze Skill Gap
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Profile Completion */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="card cursor-pointer hover:shadow-md transition-all" onClick={() => navigate('/applicant/profile')}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">Profile</div>
              <div className="text-2xl font-bold text-gray-900">{stats?.profileCompletion || 0}%</div>
              <div className="text-xs text-gray-500">Complete</div>
            </div>
            <CircularProgress value={stats?.profileCompletion || 0} size={64} />
          </div>
          <div className="progress-bar">
            <div className="progress-fill bg-blue-600" style={{ width: `${stats?.profileCompletion || 0}%` }} />
          </div>
        </motion.div>

        {/* Application Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="card cursor-pointer hover:shadow-md transition-all" onClick={() => navigate('/applicant/applications')}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="text-blue-600" size={20} />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-gray-400 font-medium">Application</div>
              <span className={`badge ${appStatusCfg.color} mt-1`}>{appStatusCfg.label}</span>
              <div className="text-xs text-gray-400 mt-1">{stats?.totalApplications || 0} total</div>
            </div>
          </div>
        </motion.div>

        {/* Course Enrollment */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="card cursor-pointer hover:shadow-md transition-all" onClick={() => navigate('/applicant/courses')}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen className="text-green-600" size={20} />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-gray-400 font-medium">Course</div>
              <div className="text-sm font-semibold text-gray-800 truncate mt-1">{stats?.courseEnrolled || 'None enrolled'}</div>
              <div className="text-xs text-gray-400">{stats?.totalEnrollments || 0} enrolled</div>
            </div>
          </div>
        </motion.div>

        {/* Verification */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="card cursor-pointer hover:shadow-md transition-all" onClick={() => navigate('/applicant/verification')}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="text-purple-600" size={20} />
            </div>
            <div>
              <div className="text-xs text-gray-400 font-medium">Verification</div>
              <span className={`badge ${verCfg.color} mt-1`}>{verCfg.label}</span>
            </div>
          </div>
        </motion.div>

        {/* AI Gap Analysis */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="card cursor-pointer hover:shadow-md transition-all col-span-2 lg:col-span-1" onClick={() => navigate('/applicant/ai-gap-analyzer')}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Brain className="text-purple-600" size={20} />
            </div>
            <div>
              <div className="text-xs text-gray-400 font-medium">AI Gap Analysis</div>
              <div className="text-2xl font-bold text-purple-700">{stats?.gapAnalysisCount || 0}</div>
              <div className="text-xs text-gray-400">analyses done</div>
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="card cursor-pointer hover:shadow-md transition-all" onClick={() => navigate('/applicant/notifications')}>
          <div className="flex items-start gap-3">
            <div className="relative w-10 h-10 flex-shrink-0">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                <Bell className="text-orange-600" size={20} />
              </div>
              {(stats?.unreadNotifications || 0) > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {stats?.unreadNotifications}
                </span>
              )}
            </div>
            <div>
              <div className="text-xs text-gray-400 font-medium">Notifications</div>
              <div className="text-2xl font-bold text-gray-800">{stats?.unreadNotifications || 0}</div>
              <div className="text-xs text-gray-400">unread</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="card">
        <h2 className="font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Brain, label: 'AI Gap Analyzer', path: '/applicant/ai-gap-analyzer', color: 'text-purple-600 bg-purple-50 hover:bg-purple-100' },
            { icon: BookOpen, label: 'Browse Courses', path: '/applicant/courses', color: 'text-green-600 bg-green-50 hover:bg-green-100' },
            { icon: User, label: 'Edit Profile', path: '/applicant/profile', color: 'text-blue-600 bg-blue-50 hover:bg-blue-100' },
            { icon: FileText, label: 'Track Application', path: '/applicant/applications', color: 'text-orange-600 bg-orange-50 hover:bg-orange-100' },
          ].map(({ icon: Icon, label, path, color }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${color}`}
            >
              <Icon size={22} />
              <span className="text-xs font-medium text-center">{label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Skills Preview */}
      {profile?.applicantSkills?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Your Skills</h2>
            <button onClick={() => navigate('/applicant/profile')} className="text-sm text-blue-600 flex items-center gap-1 hover:text-blue-800">
              Manage <ArrowRight size={14} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.applicantSkills.map((s: any) => (
              <span key={s.id} className="badge badge-blue">{s.skill.name}</span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
