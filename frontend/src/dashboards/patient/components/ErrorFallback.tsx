import React from 'react';
import { ExclamationIcon } from './Icons';
import Button from './Button';

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  title?: string;
  message?: string;
  showReload?: boolean;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  title = 'Something went wrong',
  message = 'We encountered an unexpected error. Please try again.',
  showReload = true,
}) => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <ExclamationIcon className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {title}
        </h2>
        
        <p className="text-gray-600 mb-6">
          {message}
        </p>

        {process.env.NODE_ENV === 'development' && error && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg text-left">
            <p className="text-sm font-semibold text-red-800 mb-2">
              Error Details (Development Only):
            </p>
            <p className="text-xs text-red-700 font-mono break-all">
              {error.toString()}
            </p>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          {resetError && (
            <Button
              variant="outline"
              onClick={resetError}
            >
              Try Again
            </Button>
          )}
          {showReload && (
            <Button
              variant="primary"
              onClick={handleReload}
            >
              Reload Page
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;
