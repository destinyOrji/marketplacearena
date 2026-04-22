import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ErrorType, AppError } from '../types';

// Base API URL from environment variable or default to localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';

// Simple in-memory cache for API responses
interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper to generate cache key from request config
const getCacheKey = (config: InternalAxiosRequestConfig): string => {
  return `${config.method}:${config.url}:${JSON.stringify(config.params)}`;
};

// Helper to check if cache entry is still valid
const isCacheValid = (entry: CacheEntry): boolean => {
  return Date.now() - entry.timestamp < CACHE_DURATION;
};

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authentication token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    const appError: AppError = {
      type: ErrorType.SERVER_ERROR,
      message: 'An unexpected error occurred',
      details: error,
    };

    if (error.response) {
      // Server responded with error status
      const status = error.response.status;

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          appError.type = ErrorType.AUTH_ERROR;
          appError.message = 'Your session has expired. Please login again.';
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;

        case 403:
          appError.type = ErrorType.AUTH_ERROR;
          appError.message = 'You do not have permission to perform this action.';
          break;

        case 404:
          appError.type = ErrorType.NOT_FOUND;
          appError.message = 'The requested resource was not found.';
          break;

        case 422:
        case 400:
          appError.type = ErrorType.VALIDATION_ERROR;
          appError.message = (error.response.data as any)?.message || 'Invalid data provided.';
          appError.details = (error.response.data as any)?.errors || error.response.data;
          break;

        case 500:
        case 502:
        case 503:
          appError.type = ErrorType.SERVER_ERROR;
          appError.message = 'Server error. Please try again later.';
          break;

        default:
          appError.message = (error.response.data as any)?.message || 'An error occurred.';
      }
    } else if (error.request) {
      // Request was made but no response received
      appError.type = ErrorType.NETWORK_ERROR;
      appError.message = 'Network error. Please check your internet connection.';
    } else {
      // Something else happened
      appError.message = error.message || 'An unexpected error occurred.';
    }

    return Promise.reject(appError);
  }
);

export default apiClient;
