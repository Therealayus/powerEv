/**
 * Centralized API client - attaches JWT from localStorage for partner routes
 * In production (Vercel), set VITE_API_URL to your backend URL + /api (e.g. https://ev-charging-api.onrender.com/api)
 */
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Surface backend error message for consistent UI handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.message || err.message;
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(err);
  }
);

export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const sendVerificationOtp = (email) => api.post('/auth/send-verification-otp', { email });
export const verifyEmail = (email, otp) => api.post('/auth/verify-email', { email, otp });
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = (email, otp, newPassword) => api.post('/auth/reset-password', { email, otp, newPassword });

export const getDashboard = () => api.get('/partner/dashboard');
export const getMyStations = () => api.get('/partner/stations');
export const createStation = (data) => api.post('/partner/stations', data);
export const updateStation = (id, data) => api.put(`/partner/stations/${id}`, data);
export const getMySessions = () => api.get('/partner/sessions');

// Terms (public read)
export const getTerms = () => api.get('/terms');

// Admin only
export const updateTerms = (content) => api.put('/admin/terms', { content });

export default api;
