// Error handling utilities

import { ErrorType, AppError } from '../types';

/**
 * Create an AppError object
 */
export const createError = (type: ErrorType, message: string, details?: any): AppError => {
  return {
    type,
    message,
    details,
  };
};

/**
 * Parse API error response
 */
export const parseApiError = (error: any): AppError => {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const message = error.response.data?.message || error.response.data?.error || 'An error occurred';

    if (status === 401 || status === 403) {
      return createError(ErrorType.AUTH_ERROR, 'Authentication failed. Please login again.');
    } else if (status === 404) {
      return createError(ErrorType.NOT_FOUND, 'The requested resource was not found.');
    } else if (status === 422 || status === 400) {
      return createError(ErrorType.VALIDATION_ERROR, message, error.response.data);
    } else if (status >= 500) {
      return createError(ErrorType.SERVER_ERROR, 'Server error. Please try again later.');
    }

    return createError(ErrorType.SERVER_ERROR, message);
  } else if (error.request) {
    // Request made but no response received
    return createError(ErrorType.NETWORK_ERROR, 'Network error. Please check your connection.');
  } else {
    // Something else happened
    return createError(ErrorType.SERVER_ERROR, error.message || 'An unexpected error occurred');
  }
};

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error: AppError): string => {
  return error.message;
};

/**
 * Check if error is authentication error
 */
export const isAuthError = (error: AppError): boolean => {
  return error.type === ErrorType.AUTH_ERROR;
};

/**
 * Check if error is network error
 */
export const isNetworkError = (error: AppError): boolean => {
  return error.type === ErrorType.NETWORK_ERROR;
};
