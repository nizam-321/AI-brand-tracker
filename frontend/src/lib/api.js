// src/lib/api.js
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth APIs
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (data) => api.post('/auth/signup', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Mentions APIs
export const mentionsAPI = {
  getAll: (params) => api.get('/mentions', { params }),
  getById: (id) => api.get(`/mentions/${id}`),
  getByBrand: (brandName, params) => api.get(`/mentions/brand/${brandName}`, { params }),
  create: (data) => api.post('/mentions', data),
  delete: (id) => api.delete(`/mentions/${id}`),
};

// Analytics APIs
export const analyticsAPI = {
  getSummary: (params) => api.get('/analytics/summary', { params }),
  getTimeline: (params) => api.get('/analytics/timeline', { params }),
  getSentimentTrend: (params) => api.get('/analytics/sentiment-trend', { params }),
  getTopKeywords: (params) => api.get('/analytics/top-keywords', { params }),
  getInfluencers: (params) => api.get('/analytics/influencers', { params }),
  getComparison: (params) => api.get('/analytics/comparison', { params }),
};

export default api;