/**
 * Provider Payment Verify Page
 * Handles payment verification for provider subscriptions (Hospital, Gym-Physio, Ambulance)
 * Paystack redirects here after checkout: /provider-payment/verify?reference=xxx
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';

const ProviderPaymentVerify: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [message, setMessage] = useState('');
  const [providerType, setProviderType] = useState<string>('');

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
    // Determine provider type from reference
    let type = 'gym-physio';
    if (reference.includes('HOSPITAL')) type = 'hospital';
    else if (reference.includes('AMBULANCE')) type = 'ambulance';
    else if (reference.includes('GYM')) type = 'gym-physio';
    
    setProviderType(type);

    try {
      // Get token based on provider type
      const tokenKey = type === 'hospital' ? 'hospitalToken' : 
                       type === 'ambulance' ? 'ambulanceToken' : 
                       'gymPhysioToken';
      const token = localStorage.getItem(tokenKey) || localStorage.getItem('authToken');

      const res = await axios.post(
        `${API_URL}/subscriptions/provider/verify-payment/${reference}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = res.data;

      if (data.success) {
        setStatus('success');
        setMessage('🎉 Subscription activated! You can now list your services and accept bookings.');
      } else {
        setStatus('failed');
        setMessage(data.message || 'Payment verification failed.');
      }
    } catch (error: any) {
      console.error('Payment verification error:', error);
      
      // If we get a 200 response but axios threw an error, treat as success
      if (error.response?.status === 200) {
        setStatus('success');
        setMessage('🎉 Payment received. Your subscription is being activated.');
      } else {
        setStatus('failed');
        setMessage(error.response?.data?.message || 'Payment verification failed. Please contact support.');
      }
    }
  };

  const getRedirectPath = () => {
    if (providerType === 'hospital') return '/hospital/subscription';
    if (providerType === 'ambulance') return '/ambulance/subscription';
    return '/gym-physio/subscription';
  };

  const getDashboardName = () => {
    if (providerType === 'hospital') return 'Hospital Dashboard';
    if (providerType === 'ambulance') return 'Ambulance Dashboard';
    return 'Gym & Physio Dashboard';
  };

  // Auto-redirect after 3 seconds on success
  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        navigate(getRedirectPath());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">

        {status === 'verifying' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto mb-6" />
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
            <p className="text-xs text-gray-400 mb-4">Redirecting to {getDashboardName()} in 3 seconds...</p>
            <button 
              onClick={() => navigate(getRedirectPath())}
              className="px-6 py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors text-sm w-full"
            >
              Go to Subscription →
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
              <button 
                onClick={() => navigate(getRedirectPath())}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm"
              >
                Try Again
              </button>
              <button 
                onClick={() => navigate(getRedirectPath())}
                className="flex-1 py-2.5 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors text-sm"
              >
                Back to Subscription
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProviderPaymentVerify;
