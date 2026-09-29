import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Globe, Shield, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function GovernmentLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Please enter your credentials');
      return;
    }
    setLoading(true);
    try {
      const { role } = await login(form.email, form.password);
      if (role === 'GOVERNMENT_OFFICIAL' || role === 'ADMIN') {
        toast.success('Welcome, Official!');
        navigate('/official/dashboard');
      } else {
        setError('Access denied. This portal is for Government Officials only.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setForm({ email: 'official@demo.com', password: 'Official@123' });
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-indigo-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-800 to-blue-950 px-8 py-8 text-center">
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                <Shield className="text-white" size={32} />
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-blue-300 mb-1">
              <Globe size={14} />
              <span className="text-sm">MH Govt. Portal — Restricted Access</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Government Official Login</h1>
            <p className="text-blue-300 text-sm mt-1">Authorized personnel only</p>
          </div>

          {/* Security notice */}
          <div className="bg-red-50 border-b border-red-100 px-8 py-3">
            <p className="text-xs text-red-700 text-center font-medium">
              🔒 Restricted Access — Demo Environment Only
            </p>
          </div>

          <div className="px-8 py-8">
            {/* Demo */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6">
              <div className="text-xs text-indigo-600 font-semibold mb-2">Demo Official Credentials</div>
              <div className="text-xs text-indigo-700 space-y-0.5 font-mono">
                <div>Email: official@demo.com</div>
                <div>Password: Official@123</div>
              </div>
              <button type="button" onClick={fillDemo} className="mt-2 text-xs text-indigo-600 underline hover:text-indigo-800">
                Click to fill automatically
              </button>
            </div>

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

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label" htmlFor="gov-email">Official Email / ID</label>
                <input
                  id="gov-email"
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input-field"
                  placeholder="official@domain.gov.in"
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="label" htmlFor="gov-password">Password</label>
                <div className="relative">
                  <input
                    id="gov-password"
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="input-field pr-12"
                    placeholder="Enter secure password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button type="button" className="text-sm text-blue-600 hover:text-blue-800">
                  Forgot password?
                </button>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white px-6 py-3.5 rounded-xl font-medium hover:bg-gray-800 transition-all shadow-md flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 size={18} className="animate-spin" /> Authenticating...</> : 'Secure Login'}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/" className="flex items-center justify-center gap-1 text-sm text-gray-400 hover:text-gray-600">
                <ArrowLeft size={14} />
                Back to Home
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Are you an Applicant?{' '}
            <Link to="/applicant/login" className="text-white font-semibold underline hover:text-gray-300">
              Applicant Login →
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
