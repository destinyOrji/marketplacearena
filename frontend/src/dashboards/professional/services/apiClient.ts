// API Client configuration for Professional Dashboard

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { parseApiError } from '../utils/errorHandling';
import { ErrorType } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';

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

    // Handle authentication errors — only redirect if token is truly missing/expired
    if (appError.type === ErrorType.AUTH_ERROR) {
      const token = localStorage.getItem('professionalToken');
      if (!token) {
        localStorage.removeItem('professionalToken');
        localStorage.removeItem('professional');
        window.location.href = '/login';
      }
    }

    // Handle rate limiting — back off for 60 seconds
    if ((error as AxiosError).response?.status === 429) {
      (window as any).__rateLimited = true;
      setTimeout(() => { (window as any).__rateLimited = false; }, 60000);
    }

    return Promise.reject(appError);
  }
);

export default apiClient;
