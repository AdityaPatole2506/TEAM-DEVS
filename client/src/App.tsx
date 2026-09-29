import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import LandingPage from './pages/LandingPage';
import ApplicantLogin from './pages/auth/ApplicantLogin';
import GovernmentLogin from './pages/auth/GovernmentLogin';
import ApplicantRegister from './pages/auth/ApplicantRegister';

// Applicant Pages
import ApplicantLayout from './layouts/ApplicantLayout';
import ApplicantDashboard from './pages/applicant/Dashboard';
import ApplicantProfile from './pages/applicant/Profile';
import MyApplications from './pages/applicant/Applications';
import CourseEnrollment from './pages/applicant/CourseEnrollment';
import Documents from './pages/applicant/Documents';
import VerificationStatus from './pages/applicant/VerificationStatus';
import AIGapAnalyzer from './pages/applicant/AIGapAnalyzer';
import Notifications from './pages/applicant/Notifications';
import ApplicantHelp from './pages/applicant/Help';

// Official Pages
import OfficialLayout from './layouts/OfficialLayout';
import OfficialDashboard from './pages/official/Dashboard';
import Trackers from './pages/official/Trackers';
import Applicants from './pages/official/Applicants';
import OfficialApplications from './pages/official/Applications';
import Verification from './pages/official/Verification';
import CourseMgmt from './pages/official/CourseMgmt';
import Reports from './pages/official/Reports';
import AIAnalytics from './pages/official/AIAnalytics';
import ActivityLogs from './pages/official/ActivityLogs';
import OfficialSettings from './pages/official/OfficialSettings';
import AdminDashboard from './pages/admin/AdminDashboard';

// Utility
import NotFound from './pages/NotFound';

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles: string[] }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (roles.length > 0 && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  const { user, isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/applicant/login" element={
        isAuthenticated && user?.role === 'APPLICANT'
          ? <Navigate to="/applicant/dashboard" replace />
          : <ApplicantLogin />
      } />
      <Route path="/applicant/register" element={
        isAuthenticated && user?.role === 'APPLICANT'
          ? <Navigate to="/applicant/dashboard" replace />
          : <ApplicantRegister />
      } />
      <Route path="/official/login" element={
        isAuthenticated && user?.role === 'GOVERNMENT_OFFICIAL'
          ? <Navigate to="/official/dashboard" replace />
          : <GovernmentLogin />
      } />

      {/* Applicant Routes */}
      <Route path="/applicant" element={
        <ProtectedRoute roles={['APPLICANT']}>
          <ApplicantLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<ApplicantDashboard />} />
        <Route path="profile" element={<ApplicantProfile />} />
        <Route path="applications" element={<MyApplications />} />
        <Route path="courses" element={<CourseEnrollment />} />
        <Route path="documents" element={<Documents />} />
        <Route path="verification" element={<VerificationStatus />} />
        <Route path="ai-gap-analyzer" element={<AIGapAnalyzer />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="help" element={<ApplicantHelp />} />
      </Route>

      {/* Official Routes */}
      <Route path="/official" element={
        <ProtectedRoute roles={['GOVERNMENT_OFFICIAL', 'ADMIN']}>
          <OfficialLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<OfficialDashboard />} />
        <Route path="trackers" element={<Trackers />} />
        <Route path="applicants" element={<Applicants />} />
        <Route path="applications" element={<OfficialApplications />} />
        <Route path="verification" element={<Verification />} />
        <Route path="courses" element={<CourseMgmt />} />
        <Route path="reports" element={<Reports />} />
        <Route path="ai-analytics" element={<AIAnalytics />} />
        <Route path="activity-logs" element={<ActivityLogs />} />
        <Route path="settings" element={<OfficialSettings />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['ADMIN']}>
          <OfficialLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<AdminDashboard />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e40af',
                color: '#fff',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '14px',
              },
              success: {
                style: { background: '#15803d' },
                iconTheme: { primary: '#fff', secondary: '#15803d' },
              },
              error: {
                style: { background: '#dc2626' },
                iconTheme: { primary: '#fff', secondary: '#dc2626' },
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
