import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FileSearch, Users, FileText, ShieldCheck,
  BookOpen, BarChart3, Brain, Activity, Settings, LogOut,
  Globe, Menu, X, Sun, Moon, Bell, ChevronDown, Shield, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const NAV_ITEMS = [
  { path: '/official/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/official/trackers', icon: FileSearch, label: 'Trackers' },
  { path: '/official/applicants', icon: Users, label: 'Applicants' },
  { path: '/official/applications', icon: FileText, label: 'Applications' },
  { path: '/official/verification', icon: ShieldCheck, label: 'Verification' },
  { path: '/official/courses', icon: BookOpen, label: 'Course Mgmt.' },
  { path: '/official/reports', icon: BarChart3, label: 'Reports' },
  { path: '/official/ai-analytics', icon: Brain, label: 'AI Analytics' },
  { path: '/official/activity-logs', icon: Activity, label: 'Activity Logs' },
  { path: '/official/settings', icon: Settings, label: 'Settings' },
];

export default function OfficialLayout() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 flex flex-col
        ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-900 border-gray-700'}
        border-r shadow-lg
        transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-5 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                <Shield className="text-white" size={18} />
              </div>
              <div>
                <div className="font-bold text-white text-sm">MH Govt. Portal</div>
                <div className="text-xs text-gray-400">Official Dashboard</div>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400"><X size={18} /></button>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto space-y-1">
          {user?.role === 'ADMIN' && (
            <NavLink
              to="/admin/dashboard"
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all mb-2 border border-purple-500/30 ${
                  isActive ? 'bg-purple-600 text-white' : 'bg-purple-950/40 text-purple-300 hover:bg-purple-900/60'
                }`
              }
            >
              <ShieldAlert size={17} />
              Admin Console
            </NavLink>
          )}
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
            <NavLink key={path} to={path} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`
              }>
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-900/30 hover:text-red-300 w-full transition-all">
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className={`flex items-center justify-between px-4 sm:px-6 h-16 border-b flex-shrink-0 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className={`lg:hidden p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              <Menu size={20} />
            </button>
            <div className="hidden sm:block">
              <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Government Official Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}>
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="relative">
              <button onClick={() => setProfileMenuOpen(!profileMenuOpen)} className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  GO
                </div>
                <span className={`hidden sm:block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Official</span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>
              <AnimatePresence>
                {profileMenuOpen && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                    className={`absolute right-0 top-full mt-2 w-48 rounded-xl shadow-lg border overflow-hidden z-50 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className={`px-4 py-3 border-b text-sm ${isDark ? 'border-gray-700 text-gray-200' : 'border-gray-100 text-gray-700'}`}>{user?.email}</div>
                    <button onClick={() => { setProfileMenuOpen(false); handleLogout(); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2">
                      <LogOut size={15} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className={`flex-1 overflow-y-auto p-4 sm:p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
