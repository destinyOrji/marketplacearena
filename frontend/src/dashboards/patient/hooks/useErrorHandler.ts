import { useCallback } from 'react';
import { 
  parseError, 
  getUserFriendlyMessage, 
  getValidationErrors,
  AppError,
  ErrorType,
  logError
} from '../utils/errorHandling';
import { showToast } from '../utils/toast';

interface UseErrorHandlerOptions {
  showToastOnError?: boolean;
  logErrors?: boolean;
  onError?: (error: AppError) => void;
}

interface UseErrorHandlerReturn {
  handleError: (error: unknown, context?: string, customMessage?: string) => AppError;
  parseError: (error: unknown) => AppError;
  getValidationErrors: (error: AppError) => Record<string, string>;
  isErrorType: (error: AppError, type: ErrorType) => boolean;
}

/**
 * Custom hook for consistent error handling across the application
 */
export const useErrorHandler = (
  options: UseErrorHandlerOptions = {}
): UseErrorHandlerReturn => {
  const {
    showToastOnError = true,
    logErrors = true,
    onError,
  } = options;

  const handleError = useCallback(
    (error: unknown, context?: string, customMessage?: string): AppError => {
      const appError = parseError(error);

      // Log error in development
      if (logErrors) {
        logError(error, context);
      }

      // Show toast notification
      if (showToastOnError) {
        const message = customMessage || getUserFriendlyMessage(appError);
        showToast(message, 'error');
      }

      // Call custom error handler
      if (onError) {
        onError(appError);
      }

      return appError;
    },
    [showToastOnError, logErrors, onError]
  );

  const isErrorType = useCallback((error: AppError, type: ErrorType): boolean => {
    return error.type === type;
  }, []);

  return {
    handleError,
    parseError,
    getValidationErrors,
    isErrorType,
  };
};

export default useErrorHandler;
