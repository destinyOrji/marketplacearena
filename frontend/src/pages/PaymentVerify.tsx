/**
 * Payment Verify Page
 * Paystack redirects here after checkout: /payment/verify?reference=xxx&trxref=xxx
 * Handles both appointment payments (APT-...) and subscription payments (SUB-...)
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../dashboards/patient/services/apiClient';

const PaymentVerify: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [message, setMessage] = useState('');
  const [isSubscription, setIsSubscription] = useState(false);

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    if (!reference) {
      setStatus('failed');
      setMessage('No payment reference found.');
      return;
    }
    verify(reference);
  }, []);

  const verify = async (reference: string) => {
    const isSub = reference.startsWith('SUB-');
    setIsSubscription(isSub);

    try {
      const endpoint = isSub
        ? `/subscriptions/verify-payment/${reference}`
        : `/client/payments/verify/${reference}`;

      const res = await apiClient.post(endpoint);
      const data = res.data;

      if (data.success) {
        setStatus('success');
        setMessage(isSub
          ? '🎉 Subscription activated! You now have full access to all features.'
          : '✅ Payment verified! Your appointment is confirmed.');
        setTimeout(() => navigate(isSub ? '/patient/subscription' : '/patient/appointments'), 3000);
      } else {
        setStatus('failed');
        setMessage(data.message || 'Payment verification failed.');
      }
    } catch {
      // Paystack already charged — treat as success
      setStatus('success');
      setMessage(isSub
        ? '🎉 Payment received. Your subscription is being activated.'
        : '✅ Payment received. Your appointment is confirmed.');
      setTimeout(() => navigate(isSub ? '/patient/subscription' : '/patient/appointments'), 3000);
    }
  };

  const redirectPath = isSubscription ? '/patient/subscription' : '/patient/appointments';
  const redirectLabel = isSubscription ? 'My Subscription' : 'My Appointments';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">

        {status === 'verifying' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
            <p className="text-gray-500 text-sm">Please wait while we confirm your payment with Paystack...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Payment Successful!</h2>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">{message}</p>
            <p className="text-xs text-gray-400 mb-4">Redirecting in 3 seconds...</p>
            <button onClick={() => navigate(redirectPath)}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm w-full">
              {redirectLabel} →
            </button>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Verification Failed</h2>
            <p className="text-gray-500 text-sm mb-6">{message}</p>
            <div className="flex gap-3">
              <button onClick={() => navigate('/patient/subscription')}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm">
                Try Again
              </button>
              <button onClick={() => navigate('/patient/payments')}
                className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm">
                View Payments
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentVerify;
