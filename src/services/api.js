import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
});

// Request Interceptor: Attach token if it exists
api.interceptors.request.use((config) => {
  // Check student token first, then HR token
  const hToken = sessionStorage.getItem('ta_hr_token');
  const sToken = sessionStorage.getItem('ta_token');
  const token = hToken || sToken;

  if (token) {
    if (!config.params) config.params = {};
    if (!config.params.token) {
      config.params.token = token;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg = error.response?.data?.detail || error.response?.data?.message || error.message;
    console.error('API Error:', error.response?.status, msg);
    return Promise.reject(error);
  }
);

// ── Auth ──
export const registerStudent = (data) => api.post('/auth/register', data);
export const loginStudent = (data) => api.post('/auth/login', data);
export const registerHR = (data) => api.post('/auth/hr/register', data);
export const loginHR = (data) => api.post('/auth/hr/login', data);
export const verifyToken = (token) => api.get('/auth/me', { params: { token } });

// ── Students ──
export const fetchStudents = () => api.get('/students/');
export const fetchStudent = (id) => api.get(`/students/${id}`);
export const submitProject = (data) => api.post('/students/', data);
export const deleteProject = (id) => api.delete(`/students/${id}`);
export const fetchMyProjects = () => api.get('/students/my/projects');
export const updateStudentProfile = (data) => api.post('/students/update-profile', data);
export const fetchMyProfile = (token) => api.get('/students/me', { params: { token } });
export const uploadResume = (file, token = sessionStorage.getItem('ta_token')) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('token', token);
  return api.post('/students/me/resume', formData);
};

export const applyToJob = (data) => api.post('/jobs/apply', { ...data, token: data.token || sessionStorage.getItem('ta_token') });

// ── HR ──
export const fetchShortlist = () => api.get('/hr/shortlist');
export const addToShortlist = (data) => api.post('/hr/shortlist/add', data);
export const removeFromShortlist = (data) => api.post('/hr/shortlist/remove', data);
export const updatePipelineStage = (data) => api.post('/hr/pipeline/stage', data);
export const updatePipelineNote = (data) => api.post('/hr/pipeline/note', data);
export const fetchHRStats = () => api.get('/hr/stats');

// ── Admin ──
export const fetchHRAccounts = () => api.get('/admin/hr-accounts');
export const approveHR = (data) => api.post('/admin/approve-hr', data);
export const fetchAdminStats = () => api.get('/admin/stats');
export const fetchAdminActivity = () => api.get('/admin/activity');

// ── Challenges ──
export const createChallenge = (data) => api.post('/challenges/', data);
export const fetchChallenges = () => api.get('/challenges/');
export const submitChallenge = (challengeId, data) => api.post(`/challenges/${challengeId}/submit`, data);
export const fetchChallengeSubmissions = (challengeId) => api.get(`/challenges/${challengeId}/submissions`);
export const reviewSubmission = (submissionId, data) => api.post(`/challenges/submissions/${submissionId}/review`, data);
export const fetchAllSubmissions = () => api.get('/challenges/all_submissions');
export const adminReviewSubmission = (submissionId, data) => api.post(`/challenges/submissions/${submissionId}/admin_review`, data);

// ── Jobs ──
export const fetchJobs = (params = {}) => api.get('/jobs/', { params });
export const fetchMyApplications = () => api.get('/jobs/my-applications');
export const toggleBookmark = (id) => api.post(`/jobs/bookmark?job_id=${id}`);
export const fetchBookmarks = () => api.get('/jobs/bookmarks');
export const createJob = (data) => api.post('/jobs/', data);
export const deleteJob = (id) => api.delete(`/jobs/${id}`);
export const fetchMyJobs = () => api.get('/jobs/hr/my');

// ── Notifications ──
export const fetchNotifications = () => api.get('/notifications/');
export const markNotificationsAsRead = () => api.post('/notifications/read-all');

export default api;
