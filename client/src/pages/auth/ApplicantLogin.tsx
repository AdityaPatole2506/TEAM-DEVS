import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Globe, Shield, AlertCircle, Loader2, ArrowLeft, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function ApplicantLogin() {
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
      setError('Please enter your email and password');
      return;
    }

    setLoading(true);
    try {
      const { role } = await login(form.email, form.password);
      if (role === 'APPLICANT') {
        toast.success('Welcome back!');
        navigate('/applicant/dashboard');
      } else if (role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        setError('This portal is for applicants. Please use Official Login.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setForm({ email: 'applicant@demo.com', password: 'Applicant@123' });
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-900 px-8 py-8 text-center">
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <User className="text-white" size={32} />
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-blue-200 mb-1">
              <Globe size={14} />
              <span className="text-sm">MH Govt. Portal</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Applicant Login</h1>
            <p className="text-blue-200 text-sm mt-1">Access your digital services account</p>
          </div>

          {/* Demo notice */}
          <div className="bg-amber-50 border-b border-amber-100 px-8 py-3">
            <p className="text-xs text-amber-700 text-center">
              🎓 Demo Environment — Do not enter real government credentials
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            {/* Demo credentials banner */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
              <div className="text-xs text-blue-600 font-semibold mb-2">Demo Credentials</div>
              <div className="text-xs text-blue-700 space-y-0.5 font-mono">
                <div>Email: applicant@demo.com</div>
                <div>Password: Applicant@123</div>
              </div>
              <button
                type="button"
                onClick={fillDemo}
                className="mt-2 text-xs text-blue-600 underline hover:text-blue-800"
              >
                Click to fill automatically
              </button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm"
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label" htmlFor="login-email">Email / Applicant ID</label>
                <input
                  id="login-email"
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input-field"
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="label" htmlFor="login-password">Password</label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="input-field pr-12"
                    placeholder="Enter your password"
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
                className="w-full btn-primary flex items-center justify-center gap-2 py-3.5"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Login'
                )}
              </motion.button>
            </form>

            <div className="mt-6 text-center space-y-3">
              <p className="text-sm text-gray-500">
                Don't have an account?{' '}
                <Link to="/applicant/register" className="text-blue-600 font-semibold hover:text-blue-800">
                  Create New Account
                </Link>
              </p>
              <Link
                to="/"
                className="flex items-center justify-center gap-1 text-sm text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft size={14} />
                Back to Home
              </Link>
            </div>
          </div>
        </div>

        {/* Official login link */}
        <div className="mt-6 text-center">
          <p className="text-blue-200 text-sm">
            Are you a Government Official?{' '}
            <Link to="/official/login" className="text-white font-semibold underline hover:text-blue-200">
              Official Login →
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
