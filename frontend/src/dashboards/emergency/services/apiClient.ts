// API Client configuration

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('emergency_token') || localStorage.getItem('ambulanceToken') || localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('emergency_token');
      localStorage.removeItem('ambulanceToken');
      localStorage.removeItem('ambulance');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
