import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Book, CreditCard, Fingerprint, Lock, CheckCircle,
  ArrowLeft, ArrowRight, Globe, Loader2, Eye, EyeOff,
  AlertCircle, Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api';
import toast from 'react-hot-toast';

const STEPS = [
  { id: 1, title: 'Personal Details', icon: User, description: 'Basic information' },
  { id: 2, title: 'Education', icon: Book, description: 'Academic background' },
  { id: 3, title: 'Identity', icon: CreditCard, description: 'Demo identity verification' },
  { id: 4, title: 'Biometric', icon: Fingerprint, description: 'Demo biometric' },
  { id: 5, title: 'Password', icon: Lock, description: 'Set your password' },
  { id: 6, title: 'Review', icon: CheckCircle, description: 'Confirm & submit' },
];

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ characters', ok: password.length >= 8 },
    { label: 'Uppercase', ok: /[A-Z]/.test(password) },
    { label: 'Lowercase', ok: /[a-z]/.test(password) },
    { label: 'Number', ok: /[0-9]/.test(password) },
    { label: 'Special', ok: /[^a-zA-Z0-9]/.test(password) },
  ];
  const strength = checks.filter(c => c.ok).length;
  const colors = ['bg-red-400', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-green-500'];
  const labels = ['', 'Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i <= strength ? colors[strength] : 'bg-gray-200'}`} />
        ))}
      </div>
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">{labels[strength]}</span>
        <div className="flex gap-2">
          {checks.map(c => (
            <span key={c.label} className={`text-xs ${c.ok ? 'text-green-600' : 'text-gray-300'}`}>✓</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ApplicantRegister() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [biometricState, setBiometricState] = useState<'idle' | 'scanning' | 'success'>('idle');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    // Step 1
    fullName: '', dob: '', gender: '', email: '', mobile: '',
    alternateMobile: '', location: '', currentAddress: '', permanentAddress: '',
    // Step 2
    qualification: '', institution: '', course: '', specialization: '', graduationYear: '',
    skills: '',
    // Step 3
    maskedAadhaar: 'XXXX-XXXX-1234',
    // Step 4
    biometricVerified: false,
    // Step 5
    password: '', confirmPassword: '',
  });

  const update = (key: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setError('');
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        if (!form.fullName.trim()) return 'Full name is required';
        if (!form.email.includes('@')) return 'Valid email is required';
        if (!form.mobile || form.mobile.length < 10) return 'Valid mobile number is required';
        if (!form.gender) return 'Please select your gender';
        return null;
      case 2:
        if (!form.qualification) return 'Qualification is required';
        if (!form.institution) return 'Institution name is required';
        if (!form.course) return 'Course name is required';
        return null;
      case 4:
        if (!form.biometricVerified) return 'Please complete biometric verification';
        return null;
      case 5:
        if (form.password.length < 8) return 'Password must be at least 8 characters';
        if (form.password !== form.confirmPassword) return 'Passwords do not match';
        if (!/[A-Z]/.test(form.password)) return 'Password must contain at least one uppercase letter';
        if (!/[0-9]/.test(form.password)) return 'Password must contain a number';
        return null;
      default:
        return null;
    }
  };

  const nextStep = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    setStep(s => s + 1);
  };

  const startBiometric = () => {
    setBiometricState('scanning');
    setTimeout(() => {
      setBiometricState('success');
      update('biometricVerified', true);
    }, 3000);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        dob: form.dob || undefined,
        gender: form.gender,
        mobile: form.mobile,
        alternateMobile: form.alternateMobile || undefined,
        location: form.location || undefined,
        currentAddress: form.currentAddress || undefined,
        permanentAddress: form.permanentAddress || undefined,
        maskedAadhaar: form.maskedAadhaar,
      };

      await authApi.register(payload);
      await login(form.email, form.password);
      toast.success('Account created successfully! Welcome to MH Gov Portal.');
      navigate('/applicant/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label">Full Name *</label>
                <input className="input-field" value={form.fullName} onChange={e => update('fullName', e.target.value)} placeholder="As per official records" />
              </div>
              <div>
                <label className="label">Date of Birth</label>
                <input type="date" className="input-field" value={form.dob} onChange={e => update('dob', e.target.value)} />
              </div>
              <div>
                <label className="label">Gender *</label>
                <select className="input-field" value={form.gender} onChange={e => update('gender', e.target.value)}>
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                  <option>Prefer not to say</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="label">Email Address *</label>
                <input type="email" className="input-field" value={form.email} onChange={e => update('email', e.target.value)} placeholder="your@email.com" />
              </div>
              <div>
                <label className="label">Mobile Number *</label>
                <input type="tel" className="input-field" value={form.mobile} onChange={e => update('mobile', e.target.value)} placeholder="10-digit mobile" maxLength={10} />
              </div>
              <div>
                <label className="label">Alternate Mobile</label>
                <input type="tel" className="input-field" value={form.alternateMobile} onChange={e => update('alternateMobile', e.target.value)} placeholder="Optional" maxLength={10} />
              </div>
              <div>
                <label className="label">Location / City</label>
                <input className="input-field" value={form.location} onChange={e => update('location', e.target.value)} placeholder="e.g. Mumbai, Pune" />
              </div>
              <div className="md:col-span-2">
                <label className="label">Current Address</label>
                <textarea className="input-field h-20 resize-none" value={form.currentAddress} onChange={e => update('currentAddress', e.target.value)} placeholder="Flat/House No., Street, Area..." />
              </div>
              <div className="md:col-span-2">
                <label className="label">Permanent Address</label>
                <textarea className="input-field h-20 resize-none" value={form.permanentAddress} onChange={e => update('permanentAddress', e.target.value)} placeholder="Village/Town, District..." />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label">Highest Qualification *</label>
                <select className="input-field" value={form.qualification} onChange={e => update('qualification', e.target.value)}>
                  <option value="">Select Qualification</option>
                  {['10th Pass', '12th Pass', 'Diploma', 'B.A.', 'B.Sc.', 'B.Com.', 'BCA', 'B.Tech / B.E.', 'MCA', 'M.Tech', 'MBA', 'Other'].map(q => <option key={q}>{q}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="label">College / Institute *</label>
                <input className="input-field" value={form.institution} onChange={e => update('institution', e.target.value)} placeholder="Name of institution" />
              </div>
              <div>
                <label className="label">Course / Stream *</label>
                <input className="input-field" value={form.course} onChange={e => update('course', e.target.value)} placeholder="e.g. Computer Science" />
              </div>
              <div>
                <label className="label">Specialization</label>
                <input className="input-field" value={form.specialization} onChange={e => update('specialization', e.target.value)} placeholder="e.g. AI & ML" />
              </div>
              <div>
                <label className="label">Graduation Year</label>
                <input type="number" className="input-field" value={form.graduationYear} onChange={e => update('graduationYear', e.target.value)} placeholder="e.g. 2023" min="1990" max="2030" />
              </div>
              <div>
                <label className="label">Skills (comma-separated)</label>
                <input className="input-field" value={form.skills} onChange={e => update('skills', e.target.value)} placeholder="e.g. Java, Python, SQL" />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-amber-700 text-sm font-medium">⚠️ Demo Environment</p>
              <p className="text-amber-600 text-xs mt-1">Do not enter real Aadhaar numbers. This field uses a masked demo format only.</p>
            </div>
            <div>
              <label className="label">Aadhaar (Demo — Masked Format)</label>
              <div className="relative">
                <input
                  className="input-field pr-32 font-mono text-lg tracking-widest"
                  value={form.maskedAadhaar}
                  readOnly
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 badge badge-yellow text-xs">
                  Demo ID
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Format: XXXX-XXXX-XXXX (last 4 digits visible)</p>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-700 font-medium text-sm mb-2">
                <Shield size={16} />
                Identity Verification Status
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Pending verification (Demo environment)</span>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 text-center">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
              <p className="text-amber-700 text-sm">🎭 This is a simulated biometric interface. No real biometric data is collected.</p>
            </div>

            <div className="py-6">
              {biometricState === 'idle' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="w-32 h-32 mx-auto border-4 border-dashed border-gray-200 rounded-full flex items-center justify-center mb-4">
                    <Fingerprint size={48} className="text-gray-300" />
                  </div>
                  <p className="text-gray-500 mb-2">Biometric Verification</p>
                  <div className="badge badge-gray mx-auto">Not Verified</div>
                  <div className="mt-6">
                    <button onClick={startBiometric} className="btn-primary px-8 py-3">
                      Start Demo Verification
                    </button>
                  </div>
                </motion.div>
              )}

              {biometricState === 'scanning' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-4">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <div className="w-full h-full border-4 border-blue-500 rounded-full pulse-ring flex items-center justify-center">
                      <Fingerprint size={48} className="text-blue-500" />
                    </div>
                    <div className="absolute inset-0 rounded-full overflow-hidden">
                      <div className="scan-line absolute w-full h-0.5 bg-blue-400/60 blur-sm"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-blue-600">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="font-medium">Scanning fingerprint...</span>
                  </div>
                  <div className="mt-2 flex justify-center gap-1">
                    {[1, 2, 3].map(i => (
                      <motion.div key={i} className="w-2 h-2 bg-blue-400 rounded-full"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {biometricState === 'success' && (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                  <div className="w-32 h-32 mx-auto bg-green-50 border-4 border-green-400 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle size={48} className="text-green-500" />
                  </div>
                  <p className="text-green-700 font-semibold text-lg">Demo Biometric Verification Successful!</p>
                  <p className="text-gray-400 text-sm mt-1">Simulation complete — no real data captured</p>
                  <div className="badge badge-green mx-auto mt-3">Verified (Demo)</div>
                </motion.div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-5">
            <div>
              <label className="label">Password *</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field pr-12"
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  placeholder="Create a strong password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {form.password && <PasswordStrength password={form.password} />}
            </div>
            <div>
              <label className="label">Confirm Password *</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  className="input-field pr-12"
                  value={form.confirmPassword}
                  onChange={e => update('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
              )}
              {form.confirmPassword && form.password === form.confirmPassword && (
                <p className="text-green-600 text-xs mt-1">✓ Passwords match</p>
              )}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-blue-700 text-sm font-medium mb-3">Please review your information before submitting</p>

              {[
                { label: 'Full Name', val: form.fullName },
                { label: 'Email', val: form.email },
                { label: 'Gender', val: form.gender },
                { label: 'Mobile', val: form.mobile },
                { label: 'Location', val: form.location || '—' },
                { label: 'Qualification', val: form.qualification || '—' },
                { label: 'Institution', val: form.institution || '—' },
                { label: 'Course', val: form.course || '—' },
                { label: 'Aadhaar (Demo)', val: form.maskedAadhaar },
                { label: 'Biometric', val: form.biometricVerified ? '✓ Verified (Demo)' : '✗ Not verified' },
              ].map(({ label, val }) => (
                <div key={label} className="flex justify-between py-1.5 border-b border-blue-100 last:border-0">
                  <span className="text-gray-500 text-sm">{label}</span>
                  <span className="text-gray-800 text-sm font-medium">{val}</span>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700">
              By creating an account, you confirm this is a demo/educational portal and no real government credentials have been entered.
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 text-blue-200 mb-2">
            <Globe size={16} />
            <span className="text-sm">MH Govt. Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Applicant Registration</h1>
        </div>

        {/* Progress Steps */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            {STEPS.map((s, idx) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isDone = step > s.id;
              return (
                <React.Fragment key={s.id}>
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                      isDone ? 'bg-green-500 border-green-500' : isActive ? 'bg-blue-500 border-blue-400' : 'bg-white/10 border-white/20'
                    }`}>
                      {isDone ? <CheckCircle size={16} className="text-white" /> : <Icon size={16} className={isActive ? 'text-white' : 'text-white/40'} />}
                    </div>
                    <span className={`text-xs mt-1 hidden sm:block ${isActive ? 'text-white' : 'text-white/40'}`}>{s.title}</span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 ${step > s.id ? 'bg-green-400' : 'bg-white/20'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Demo notice */}
          <div className="bg-amber-50 border-b border-amber-100 px-6 py-2.5">
            <p className="text-xs text-amber-700 text-center">🎓 Demo Environment — Do not enter real government credentials or sensitive personal information</p>
          </div>

          <div className="px-8 py-8">
            {/* Step header */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Step {step}: {STEPS[step - 1].title}
              </h2>
              <p className="text-gray-400 text-sm mt-1">{STEPS[step - 1].description}</p>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm"
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}

            {/* Step content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={() => step === 1 ? navigate('/applicant/login') : setStep(s => s - 1)}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium"
              >
                <ArrowLeft size={16} />
                {step === 1 ? 'Back to Login' : 'Back'}
              </button>

              {step < 6 ? (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={nextStep}
                  className="btn-primary flex items-center gap-2"
                >
                  Next
                  <ArrowRight size={16} />
                </motion.button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-primary flex items-center gap-2"
                >
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account...</> : <><CheckCircle size={16} /> Create Account</>}
                </motion.button>
              )}
            </div>

            {step === 1 && (
              <p className="text-center text-sm text-gray-400 mt-4">
                Already have an account?{' '}
                <Link to="/applicant/login" className="text-blue-600 font-semibold hover:text-blue-800">Login</Link>
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
