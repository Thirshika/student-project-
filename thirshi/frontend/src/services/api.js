import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Request Interceptor: Attach token if it exists
api.interceptors.request.use((config) => {
  // Check student token first, then HR token
  const hToken = sessionStorage.getItem('ta_hr_token');
  const sToken = sessionStorage.getItem('ta_token');
  const token = hToken || sToken;

  if (token) {
    config.params = { ...config.params, token };
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// ── Auth ──
export const registerStudent = (data) => api.post('/auth/register', data);
export const loginStudent = (data) => api.post('/auth/login', data);
export const registerHR = (data) => api.post('/auth/hr/register', data);
export const loginHR = (data) => api.post('/auth/hr/login', data);
export const verifyToken = (token) => api.get(`/auth/me?token=${token}`);

// ── Students ──
export const fetchStudents = () => api.get('/students/');
export const fetchStudent = (id) => api.get(`/students/${id}`);
export const submitProject = (data) => api.post('/students/', data);
export const deleteProject = (id) => api.delete(`/students/${id}`);
export const fetchMyProjects = () => api.get('/students/my/projects');
export const updateStudentProfile = (data) => api.post('/students/update-profile', data);
export const uploadResume = (studentId, formData) => api.post(`/students/${studentId}/resume`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

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
export const applyToJob = (data) => api.post('/jobs/apply', data);
export const fetchMyApplications = (token) => api.get('/jobs/my-applications', { params: { token } });
export const toggleBookmark = (token, id) => api.post(`/jobs/bookmark?token=${token}&job_id=${id}`);
export const fetchBookmarks = (token) => api.get('/jobs/bookmarks', { params: { token } });
export const createJob = (data) => api.post('/jobs/', data);
export const deleteJob = (id) => api.delete(`/jobs/${id}`);
export const fetchMyJobs = () => api.get('/jobs/hr/my');

export default api;
