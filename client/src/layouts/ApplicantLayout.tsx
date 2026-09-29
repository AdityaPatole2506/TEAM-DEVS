import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, User, FileText, BookOpen, FolderOpen,
  ShieldCheck, Brain, Bell, HelpCircle, LogOut, Globe,
  Menu, X, Search, Sun, Moon, ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const NAV_ITEMS = [
  { path: '/applicant/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/applicant/profile', icon: User, label: 'My Profile' },
  { path: '/applicant/applications', icon: FileText, label: 'My Applications' },
  { path: '/applicant/courses', icon: BookOpen, label: 'Course Enrollment' },
  { path: '/applicant/documents', icon: FolderOpen, label: 'Documents' },
  { path: '/applicant/verification', icon: ShieldCheck, label: 'Verification Status' },
  { path: '/applicant/ai-gap-analyzer', icon: Brain, label: 'AI Gap Analyzer' },
  { path: '/applicant/notifications', icon: Bell, label: 'Notifications' },
  { path: '/applicant/help', icon: HelpCircle, label: 'Help' },
];

export default function ApplicantLayout() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const userInitials = (user as any)?.profile?.fullName
    ? (user as any).profile.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AP';

  const userName = (user as any)?.profile?.fullName || user?.email || 'Applicant';

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 flex flex-col
        ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}
        border-r shadow-sm
        transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className={`p-5 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-700 rounded-xl flex items-center justify-center">
                <Globe className="text-white" size={18} />
              </div>
              <div>
                <div className="font-bold text-blue-700 text-sm">MH Govt. Portal</div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>Applicant Portal</div>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 overflow-y-auto space-y-1">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `sidebar-link text-sm ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
          <button
            onClick={handleLogout}
            className={`sidebar-link text-sm w-full text-red-500 hover:bg-red-50 hover:text-red-600`}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top navbar */}
        <header className={`flex items-center justify-between px-4 sm:px-6 h-16 border-b shadow-sm flex-shrink-0 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className={`lg:hidden p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <Menu size={20} />
            </button>
            <div className={`relative hidden sm:flex items-center`}>
              <Search size={16} className="absolute left-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className={`pl-9 pr-4 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-gray-50 border-gray-200'}`}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}>
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <NavLink to="/applicant/notifications" className={`relative p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </NavLink>

            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {userInitials}
                </div>
                <span className={`hidden sm:block text-sm font-medium max-w-24 truncate ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {userName.split(' ')[0]}
                </span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              <AnimatePresence>
                {profileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className={`absolute right-0 top-full mt-2 w-48 rounded-xl shadow-lg border overflow-hidden z-50 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
                  >
                    <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                      <div className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{userName}</div>
                      <div className="text-xs text-gray-400 truncate">{user?.email}</div>
                    </div>
                    <button
                      onClick={() => { setProfileMenuOpen(false); navigate('/applicant/profile'); }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 flex items-center gap-2 ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600'}`}
                    >
                      <User size={15} /> My Profile
                    </button>
                    <button
                      onClick={() => { setProfileMenuOpen(false); handleLogout(); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut size={15} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className={`flex-1 overflow-y-auto p-4 sm:p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
