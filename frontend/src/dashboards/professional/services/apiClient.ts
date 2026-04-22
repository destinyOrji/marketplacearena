// API Client configuration for Professional Dashboard

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { parseApiError } from '../utils/errorHandling';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api/v1';

/**
 * Create and configure axios instance
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to add JWT token
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('professionalToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor for error handling
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const appError = parseApiError(error);

    // Handle authentication errors
    if (appError.type === 'AUTH_ERROR') {
      localStorage.removeItem('professionalToken');
      localStorage.removeItem('professional');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(appError);
  }
);

export default apiClient;
