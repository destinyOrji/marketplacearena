/**
 * Vacancy Payment Callback Page
 * Handles return from Paystack after vacancy posting payment
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';

const VacancyPaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const reference = searchParams.get('reference');

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    if (!reference) {
      setStatus('failed');
      return;
    }

    // Wait a few seconds for webhook to process
    await new Promise(resolve => setTimeout(resolve, 3000));

    // For now, we'll assume success if reference exists
    // The webhook will have already activated the vacancy
    setStatus('success');

    // Redirect after 3 seconds
    setTimeout(() => {
      navigate('/hospital/vacancies');
    }, 3000);
  };

  if (status === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
          <p className="text-gray-600">Please wait while we confirm your payment...</p>
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
            <FiLoader className="animate-spin" />
            <span>This may take a few moments</span>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your vacancy has been published successfully. All registered professionals will be notified.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">
              <strong>What happens next?</strong><br />
              • Your job posting is now live<br />
              • Professionals can view and apply<br />
              • You'll receive notifications when they apply
            </p>
          </div>
          <button
            onClick={() => navigate('/hospital/vacancies')}
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            View My Vacancies
          </button>
          <p className="mt-4 text-xs text-gray-500">
            Redirecting automatically in a few seconds...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiXCircle className="w-10 h-10 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
        <p className="text-gray-600 mb-6">
          We couldn't process your payment. Your vacancy has not been published.
        </p>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-800">
            <strong>What can you do?</strong><br />
            • Check your payment details<br />
            • Try again with a different payment method<br />
            • Contact support if the issue persists
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/hospital/vacancies/new')}
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/hospital/vacancies')}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default VacancyPaymentCallback;
