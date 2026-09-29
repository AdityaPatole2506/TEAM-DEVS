import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Globe, Shield, Users, Brain, ArrowRight, CheckCircle,
  BookOpen, BarChart3, Bell, FileText, Moon, Sun, Menu, X,
  ChevronRight, Star, Award, Zap
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const FEATURES = [
  { icon: Shield, title: 'Secure Identity Verification', desc: 'Multi-layer identity verification with demo Aadhaar and biometric simulation.', color: 'bg-blue-50 text-blue-600' },
  { icon: Brain, title: 'AI Gap Analyzer', desc: 'Intelligent skill gap analysis powered by AI to map your career journey.', color: 'bg-purple-50 text-purple-600' },
  { icon: BookOpen, title: 'Course Enrollment', desc: 'Browse and enroll in government-recognized skill development programs.', color: 'bg-green-50 text-green-600' },
  { icon: BarChart3, title: 'Application Tracking', desc: 'Real-time tracking of your applications with visual timeline.', color: 'bg-orange-50 text-orange-600' },
  { icon: FileText, title: 'Official Records', desc: 'Government officials manage applicant records, EPFO & GST verification.', color: 'bg-cyan-50 text-cyan-600' },
  { icon: Bell, title: 'Smart Notifications', desc: 'Stay updated with instant notifications on your application status.', color: 'bg-pink-50 text-pink-600' },
];

const STATS = [
  { value: '1,248+', label: 'Registered Applicants' },
  { value: '8', label: 'Skill Programs' },
  { value: '932', label: 'Verified Profiles' },
  { value: '3,421', label: 'Skill Gaps Analyzed' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>

      {/* Demo Notice */}
      <div className="bg-amber-500 text-white text-center py-2 px-4 text-sm font-medium">
        🎓 Academic Project / Demonstration Portal — Do not enter real government credentials or sensitive information
      </div>

      {/* Navbar */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? isDark ? 'bg-gray-900/95 backdrop-blur shadow-lg border-b border-gray-700' : 'bg-white/95 backdrop-blur shadow-lg border-b border-gray-100'
          : isDark ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-700 rounded-lg flex items-center justify-center">
                <Globe className="text-white" size={20} />
              </div>
              <div>
                <div className="font-bold text-blue-700 text-sm leading-tight">MH Govt. Portal</div>
                <div className="text-xs text-gray-500 leading-tight">Digital Services</div>
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              {['Home', 'About', 'Services', 'Help'].map(item => (
                <a key={item} href="#" className={`text-sm font-medium hover:text-blue-600 transition-colors ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {item}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                aria-label="Toggle dark mode"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                onClick={() => navigate('/applicant/login')}
                className="hidden md:block text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/applicant/register')}
                className="hidden md:block btn-primary text-sm py-2 px-4"
              >
                Register
              </button>
              <button
                className="md:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`md:hidden border-t px-4 py-4 space-y-3 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}
          >
            {['Home', 'About', 'Services', 'Help'].map(item => (
              <a key={item} href="#" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{item}</a>
            ))}
            <div className="flex gap-3 pt-2">
              <button onClick={() => navigate('/applicant/login')} className="flex-1 btn-secondary text-sm py-2">Login</button>
              <button onClick={() => navigate('/applicant/register')} className="flex-1 btn-primary text-sm py-2">Register</button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-200 rounded-full px-4 py-1.5 text-sm mb-6">
                <Star size={14} />
                <span>Maharashtra Government Digital Initiative</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
                MH Government{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">
                  Digital Services
                </span>{' '}
                Portal
              </h1>
              <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                A unified platform for applicant registration, government service tracking,
                and AI-powered skill gap analysis. Bridging citizens with opportunities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/applicant/login')}
                  className="flex items-center justify-center gap-2 bg-white text-blue-800 px-6 py-3.5 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-lg"
                >
                  <Users size={18} />
                  Applicant Login
                  <ArrowRight size={16} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/official/login')}
                  className="flex items-center justify-center gap-2 bg-blue-600/40 border border-blue-400/40 text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-blue-600/60 transition-all"
                >
                  <Shield size={18} />
                  Official Login
                </motion.button>
              </div>
              <div className="mt-8 flex items-center gap-3">
                <CheckCircle className="text-green-400" size={18} />
                <span className="text-blue-200 text-sm">New applicant? </span>
                <button
                  onClick={() => navigate('/applicant/register')}
                  className="text-white font-semibold text-sm underline underline-offset-2 hover:text-blue-200"
                >
                  Create your account →
                </button>
              </div>
            </motion.div>

            {/* Right side cards */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden md:block"
            >
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Brain, title: 'AI Gap Analyzer', desc: 'Smart skill analysis', color: 'from-purple-500 to-purple-700', delay: 0 },
                  { icon: Shield, title: 'Verified Portal', desc: 'Secure & trusted', color: 'from-green-500 to-green-700', delay: 0.1 },
                  { icon: BookOpen, title: '8 Courses', desc: 'Skill programs', color: 'from-orange-500 to-orange-700', delay: 0.2 },
                  { icon: BarChart3, title: 'Live Tracking', desc: 'Real-time updates', color: 'from-cyan-500 to-cyan-700', delay: 0.3 },
                ].map(({ icon: Icon, title, desc, color, delay }) => (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: delay + 0.3 }}
                    className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5 hover:bg-white/15 transition-all"
                  >
                    <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-3`}>
                      <Icon className="text-white" size={20} />
                    </div>
                    <div className="text-white font-semibold text-sm">{title}</div>
                    <div className="text-blue-200 text-xs mt-1">{desc}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className={`py-12 border-b ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-blue-700 mb-1">{stat.value}</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={`py-20 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Complete Digital Government Services</h2>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'} max-w-2xl mx-auto`}>
              Everything you need to manage applicant registrations, track applications, and identify skill gaps — in one powerful platform.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-6 rounded-2xl border hover:shadow-md transition-all cursor-pointer ${isDark ? 'border-gray-700 hover:border-blue-500 bg-gray-800' : 'border-gray-100 hover:border-blue-200 bg-white'}`}
              >
                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon size={22} />
                </div>
                <h3 className="font-semibold text-base mb-2">{title}</h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-blue-900 to-indigo-900 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-purple-500/20 border border-purple-400/30 rounded-2xl flex items-center justify-center">
                <Brain className="text-purple-300" size={32} />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Discover Your Skill Gaps with AI</h2>
            <p className="text-blue-200 text-lg mb-8">
              Our AI Gap Analyzer compares your current skills against target roles and creates a personalized learning path just for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/applicant/register')}
                className="flex items-center justify-center gap-2 bg-white text-blue-900 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all"
              >
                <Zap size={18} />
                Get Started Free
              </button>
              <button
                onClick={() => navigate('/applicant/login')}
                className="flex items-center justify-center gap-2 border border-white/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all"
              >
                I have an account
                <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-10 border-t ${isDark ? 'bg-gray-900 border-gray-800 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-700 rounded-lg flex items-center justify-center">
                <Globe className="text-white" size={14} />
              </div>
              <span className="font-semibold text-blue-700">MH Govt. Portal</span>
            </div>
            <div className="text-center text-sm">
              <div className="font-medium text-amber-600">Academic Project / Demonstration Portal</div>
              <div className="mt-1">This is NOT an official Maharashtra Government website. For educational/demo purposes only.</div>
            </div>
            <div className="text-sm">
              Built for SIH 2026 • Demo Environment
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
