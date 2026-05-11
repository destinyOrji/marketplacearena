/**
 * PaymentModal — uses backend-initialized Paystack redirect
 * Avoids react-paystack inline popup which is blocked by Cloudflare bot protection.
 *
 * Flow:
 *  1. User clicks "Pay" → POST /client/payments → backend calls Paystack API → returns authorizationUrl
 *  2. We redirect the browser to authorizationUrl (Paystack hosted checkout)
 *  3. After payment, Paystack redirects to FRONTEND_URL/payment/verify?reference=xxx
 *  4. That page calls POST /client/payments/verify/:reference → updates appointment
 */
import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

interface PaymentModalProps {
  isOpen: boolean;
  amount: number;       // in Naira
  service: string;
  appointmentId?: string;
  onClose: () => void;
  onSuccess: (paymentId: string) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  amount,
  service,
  appointmentId,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset on open
  useEffect(() => {
    if (isOpen) { setError(''); setLoading(false); }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePay = async () => {
    setLoading(true);
    setError('');
    try {
      // Ask backend to initialize a Paystack transaction
      const res = await apiClient.post('/client/payments', {
        appointmentId: appointmentId || '',
        amount,
        service,
      });

      const data = res.data?.data ?? res.data;
      const authUrl = data?.authorizationUrl || data?.authorization_url;

      if (!authUrl) {
        throw new Error('Payment initialization failed — no redirect URL returned');
      }

      // Redirect to Paystack hosted checkout (bypasses Cloudflare JS challenge)
      window.location.href = authUrl;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to initialize payment';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget && !loading) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900">Complete Payment</h2>
          </div>
          <button onClick={onClose} disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Service</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{service}</p>
              </div>
              {appointmentId && (
                <div className="text-right">
                  <p className="text-xs text-gray-500">Appointment</p>
                  <p className="text-xs font-mono text-gray-600 mt-0.5">{appointmentId.slice(-8)}</p>
                </div>
              )}
            </div>
            <div className="border-t border-blue-100 pt-3 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Total Amount</span>
              <span className="text-2xl font-bold text-blue-600">₦{amount.toLocaleString()}</span>
            </div>
          </div>

          {/* How it works */}
          <div className="space-y-2">
            {[
              { icon: '🔒', text: 'You\'ll be redirected to Paystack\'s secure checkout' },
              { icon: '💳', text: 'Pay with card, bank transfer, or USSD' },
              { icon: '✅', text: 'Your appointment is confirmed after payment' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2.5 text-sm text-gray-600">
                <span className="text-base">{icon}</span>
                {text}
              </div>
            ))}
          </div>

          {/* Test mode notice */}
          {process.env.REACT_APP_PAYSTACK_PUBLIC_KEY?.startsWith('pk_test') && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
              <strong>🧪 Test Mode:</strong> Use card{' '}
              <code className="bg-amber-100 px-1 rounded font-mono">4084 0840 8408 4081</code>,
              any future expiry, CVV <code className="bg-amber-100 px-1 rounded font-mono">408</code>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3 bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} disabled={loading}
            className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors">
            Cancel
          </button>
          <button onClick={handlePay} disabled={loading}
            className="flex-1 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-sm">
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Initializing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Pay ₦{amount.toLocaleString()}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
