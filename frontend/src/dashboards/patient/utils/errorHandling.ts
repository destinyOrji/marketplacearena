import { AxiosError } from 'axios';

export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AppError {
  type: ErrorType;
  message: string;
  details?: any;
  statusCode?: number;
}

/**
 * Parse error from various sources into a standardized AppError format
 */
export const parseError = (error: unknown): AppError => {
  // Handle Axios errors
  if (isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;

    // Network error (no response)
    if (!axiosError.response) {
      if (axiosError.code === 'ECONNABORTED' || axiosError.message.includes('timeout')) {
        return {
          type: ErrorType.TIMEOUT_ERROR,
          message: 'Request timed out. Please check your connection and try again.',
          details: axiosError.message,
        };
      }
      return {
        type: ErrorType.NETWORK_ERROR,
        message: 'Unable to connect to the server. Please check your internet connection.',
        details: axiosError.message,
      };
    }

    const status = axiosError.response.status;
    const data = axiosError.response.data;

    // Authentication errors
    if (status === 401) {
      return {
        type: ErrorType.AUTH_ERROR,
        message: data?.message || 'Your session has expired. Please log in again.',
        statusCode: status,
        details: data,
      };
    }

    // Authorization errors
    if (status === 403) {
      return {
        type: ErrorType.AUTH_ERROR,
        message: data?.message || 'You do not have permission to perform this action.',
        statusCode: status,
        details: data,
      };
    }

    // Not found errors
    if (status === 404) {
      return {
        type: ErrorType.NOT_FOUND,
        message: data?.message || 'The requested resource was not found.',
        statusCode: status,
        details: data,
      };
    }

    // Validation errors
    if (status === 400 || status === 422) {
      return {
        type: ErrorType.VALIDATION_ERROR,
        message: data?.message || 'Please check your input and try again.',
        statusCode: status,
        details: data?.errors || data,
      };
    }

    // Server errors
    if (status >= 500) {
      return {
        type: ErrorType.SERVER_ERROR,
        message: data?.message || 'A server error occurred. Please try again later.',
        statusCode: status,
        details: data,
      };
    }

    // Other HTTP errors
    return {
      type: ErrorType.UNKNOWN_ERROR,
      message: data?.message || 'An unexpected error occurred.',
      statusCode: status,
      details: data,
    };
  }

  // Handle Error objects
  if (error instanceof Error) {
    return {
      type: ErrorType.UNKNOWN_ERROR,
      message: error.message || 'An unexpected error occurred.',
      details: error,
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      type: ErrorType.UNKNOWN_ERROR,
      message: error,
    };
  }

  // Unknown error type
  return {
    type: ErrorType.UNKNOWN_ERROR,
    message: 'An unexpected error occurred.',
    details: error,
  };
};

/**
 * Get user-friendly error message based on error type
 */
export const getUserFriendlyMessage = (error: AppError): string => {
  switch (error.type) {
    case ErrorType.NETWORK_ERROR:
      return 'Unable to connect. Please check your internet connection and try again.';
    case ErrorType.AUTH_ERROR:
      return error.message || 'Authentication failed. Please log in again.';
    case ErrorType.VALIDATION_ERROR:
      return error.message || 'Please check your input and try again.';
    case ErrorType.SERVER_ERROR:
      return 'Our servers are experiencing issues. Please try again in a few moments.';
    case ErrorType.NOT_FOUND:
      return error.message || 'The requested information could not be found.';
    case ErrorType.TIMEOUT_ERROR:
      return 'The request took too long. Please try again.';
    default:
      return error.message || 'Something went wrong. Please try again.';
  }
};

/**
 * Extract validation errors from error details
 */
export const getValidationErrors = (error: AppError): Record<string, string> => {
  if (error.type !== ErrorType.VALIDATION_ERROR || !error.details) {
    return {};
  }

  const errors: Record<string, string> = {};

  // Handle different validation error formats
  if (typeof error.details === 'object') {
    Object.keys(error.details).forEach((key) => {
      const value = error.details[key];
      if (Array.isArray(value)) {
        errors[key] = value[0];
      } else if (typeof value === 'string') {
        errors[key] = value;
      }
    });
  }

  return errors;
};

/**
 * Type guard for Axios errors
 */
function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError === true;
}

/**
 * Retry function with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain error types
      const appError = parseError(error);
      if (
        appError.type === ErrorType.AUTH_ERROR ||
        appError.type === ErrorType.VALIDATION_ERROR ||
        appError.type === ErrorType.NOT_FOUND
      ) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

/**
 * Handle error with toast notification
 */
export const handleErrorWithToast = (
  error: unknown,
  showToast: (message: string, type: 'error') => void,
  customMessage?: string
): AppError => {
  const appError = parseError(error);
  const message = customMessage || getUserFriendlyMessage(appError);
  showToast(message, 'error');
  return appError;
};

/**
 * Log error to console in development
 */
export const logError = (error: unknown, context?: string): void => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[Error${context ? ` - ${context}` : ''}]:`, error);
  }
};

/**
 * Check if error is a specific type
 */
export const isErrorType = (error: AppError, type: ErrorType): boolean => {
  return error.type === type;
};

/**
 * Create a custom error
 */
export const createError = (
  type: ErrorType,
  message: string,
  details?: any
): AppError => {
  return {
    type,
    message,
    details,
  };
};
