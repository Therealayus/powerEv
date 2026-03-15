/**
 * Centralized API client - attaches JWT from AsyncStorage to protected requests
 */
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Android emulator: 10.0.2.2. Physical device: use your PC's LAN IP (e.g. 192.168.1.x). iOS sim: localhost.
const API_BASE = 'http://10.0.2.2:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err)
);

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const sendVerificationOtp = (email) => api.post('/auth/send-verification-otp', { email });
export const verifyEmail = (email, otp) => api.post('/auth/verify-email', { email, otp });
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = (email, otp, newPassword) => api.post('/auth/reset-password', { email, otp, newPassword });

// Stations (public)
export const getStations = () => api.get('/stations');
export const getStationById = (id) => api.get(`/stations/${id}`);

// Chargers
export const getChargers = (stationId) => api.get(`/stations/${stationId}/chargers`);

// Charging (protected)
export const startCharging = (body) => api.post('/charging/start', body);
export const stopCharging = () => api.post('/charging/stop');
export const getChargingHistory = () => api.get('/charging/history');
export const getActiveCharging = () => api.get('/charging/active');

// Profile (protected)
export const getProfile = () => api.get('/auth/profile');
export const updateProfile = (data) => api.put('/auth/profile', data);
export const deleteAccount = () => api.delete('/auth/account');
export const uploadProfilePhoto = (base64) => api.post('/auth/profile/photo', { base64 });
export const acceptTerms = () => api.post('/auth/terms-accept');

// Feedback (protected)
export const submitFeedback = (data) => api.post('/feedback', data);

// Terms (public read)
export const getTerms = () => api.get('/terms');

/** Base URL of the API server (no /api). Use for profile photo URLs: getUploadBase() + profilePhoto */
export const getUploadBase = () => {
  const base = api.defaults.baseURL || '';
  return base.replace(/\/api\/?$/, '') || 'http://10.0.2.2:5000';
};

export const setBaseURL = (url) => {
  api.defaults.baseURL = url;
};

export default api;
