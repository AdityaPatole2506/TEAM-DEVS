import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mh_gov_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('mh_gov_token');
      localStorage.removeItem('mh_gov_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authApi = {
  register: (data: Record<string, unknown>) => api.post('/auth/register', data),
  login: (data: { email: string; password: string; role?: string }) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// Applicant
export const applicantApi = {
  getProfile: () => api.get('/applicant/profile'),
  updateProfile: (data: Record<string, unknown>) => api.put('/applicant/profile', data),
  getApplications: () => api.get('/applicant/applications'),
  getEnrollments: () => api.get('/applicant/enrollments'),
  getDashboard: () => api.get('/applicant/dashboard'),
  getNotifications: () => api.get('/applicant/notifications'),
  markNotificationRead: (id: string) => api.put(`/applicant/notifications/${id}/read`),
};

// Courses
export const coursesApi = {
  getAll: () => api.get('/courses'),
  getById: (id: string) => api.get(`/courses/${id}`),
  enroll: (id: string) => api.post(`/courses/${id}/enroll`),
};

// Official
export const officialApi = {
  getDashboard: () => api.get('/official/dashboard'),
  getApplicants: (params?: Record<string, string>) => api.get('/official/applicants', { params }),
  getApplicantById: (id: string) => api.get(`/official/applicants/${id}`),
  getTrackers: (params?: Record<string, string>) => api.get('/official/trackers', { params }),
  getApplications: (params?: Record<string, string>) => api.get('/official/applications', { params }),
  updateApplicationStatus: (id: string, data: { status: string; remarks?: string }) => api.put(`/official/applications/${id}/status`, data),
  updateTracker: (id: string, data: Record<string, unknown>) => api.put(`/official/trackers/${id}`, data),
  getVerifications: (params?: Record<string, string>) => api.get('/official/verifications', { params }),
  updateVerificationStatus: (id: string, data: { status: string; remarks?: string }) => api.put(`/official/verifications/${id}/status`, data),
  createCourse: (data: Record<string, unknown>) => api.post('/official/courses', data),
  updateCourse: (id: string, data: Record<string, unknown>) => api.put(`/official/courses/${id}`, data),
  deleteCourse: (id: string) => api.delete(`/official/courses/${id}`),
  getActivityLogs: (params?: Record<string, string>) => api.get('/official/activity-logs', { params }),
};

// AI Gap Analyzer
export const aiApi = {
  analyze: (data: Record<string, unknown>) => api.post('/ai/gap-analysis', data),
  getAnalysis: (id: string) => api.get(`/ai/gap-analysis/${id}`),
  getHistory: () => api.get('/ai/gap-analysis'),
};

// Analytics
export const analyticsApi = {
  getSkills: () => api.get('/analytics/skills'),
  getCourses: () => api.get('/analytics/courses'),
  getGapAnalysis: () => api.get('/analytics/gap-analysis'),
};

// Admin
export const adminApi = {
  getUsers: () => api.get('/admin/users'),
  getStats: () => api.get('/admin/stats'),
};
