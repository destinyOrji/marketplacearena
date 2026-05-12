/**
 * Shared Provider Subscription Page
 * Used by Hospital, Gym-Physio, and Ambulance dashboards.
 * Handles plan display, Paystack redirect payment, and status display.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';

interface Plan {
  id: string;
  name: string;
  duration: string;
  price: number;
  features: string[];
  popular?: boolean;
  durationMonths?: number;
}

interface ActiveSub {
  _id: string;
  plan: string;
  planName: string;
  amount: number;
  status: string;
  startDate: string;
  endDate: string;
  paymentStatus: string;
}

interface ProviderSubscriptionProps {
  role: 'hospital' | 'gym-physio' | 'ambulance';
  tokenKey: string;
  dashboardPath: string;
  title?: string;
  description?: string;
}

const ProviderSubscription: React.FC<ProviderSubscriptionProps> = ({
  role, tokenKey, dashboardPath, title, description,
}) => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [activeSub, setActiveSub] = useState<ActiveSub | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const getToken = () => localStorage.getItem(tokenKey) || localStorage.getItem('authToken') || '';

  const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansRes, statusRes] = await Promise.all([
        fetch(`${API_URL}/subscriptions/provider/plans?role=${role}`),
        fetch(`${API_URL}/subscriptions/provider/status`, { headers: headers() }),
      ]);
      const plansData = await plansRes.json();
      if (plansData.success) setPlans(plansData.data);
      const statusData = await statusRes.json();
      if (statusData.success && statusData.data?.subscription) setActiveSub(statusData.data.subscription);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load subscription data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    setProcessingPlan(planId);
    setMessage(null);
    try {
      // 1. Create subscription record
      const subRes = await fetch(`${API_URL}/subscriptions/provider/subscribe`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ planId }),
      });
      const subData = await subRes.json();
      if (!subData.success) {
        setMessage({ type: 'error', text: subData.message || 'Failed to create subscription.' });
        return;
      }

      const subscriptionId = subData.data._id;

      // 2. Initialize Paystack payment
      const initRes = await fetch(`${API_URL}/subscriptions/provider/initialize-payment/${subscriptionId}`, {
        method: 'POST',
        headers: headers(),
      });
      const initData = await initRes.json();
      if (!initData.success) {
        setMessage({ type: 'error', text: initData.message || 'Failed to initialize payment.' });
        return;
      }

      // 3. Redirect to Paystack hosted checkout
      const authUrl = initData.data?.authorizationUrl || initData.data?.authorization_url;
      if (!authUrl) {
        setMessage({ type: 'error', text: 'No payment URL returned. Please try again.' });
        return;
      }
      window.location.href = authUrl;
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'An error occurred. Please try again.' });
    } finally {
      setProcessingPlan(null);
    }
  };

  const getDaysRemaining = () => {
    if (!activeSub) return 0;
    return Math.max(0, Math.ceil((new Date(activeSub.endDate).getTime() - Date.now()) / 86400000));
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const roleLabels: Record<string, { icon: string; what: string }> = {
    hospital:    { icon: '🏥', what: 'post job vacancies and manage applications' },
    'gym-physio': { icon: '💪', what: 'list services and accept bookings' },
    ambulance:   { icon: '🚑', what: 'list your service and receive emergency bookings' },
  };
  const roleInfo = roleLabels[role] || { icon: '🏢', what: 'access all features' };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="text-5xl mb-3">{roleInfo.icon}</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {title || 'Choose Your Subscription Plan'}
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          {description || `Subscribe to ${roleInfo.what}. All payments are processed securely via Paystack.`}
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`px-5 py-4 rounded-2xl text-sm font-medium border ${
          message.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Active Subscription Banner */}
      {activeSub?.status === 'active' && (
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">✅</span>
                <h3 className="text-lg font-bold">Active Subscription</h3>
              </div>
              <p className="text-green-100 text-sm">Plan: <strong className="text-white">{activeSub.planName || activeSub.plan}</strong></p>
              <p className="text-green-100 text-sm mt-1">Valid until: <strong className="text-white">{formatDate(activeSub.endDate)}</strong></p>
              <p className="text-green-100 text-sm mt-1"><strong className="text-white">{getDaysRemaining()} days</strong> remaining</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-2xl px-5 py-3 text-center">
              <p className="text-3xl font-bold">{getDaysRemaining()}</p>
              <p className="text-xs text-green-100">days left</p>
            </div>
          </div>
          <button onClick={() => navigate(dashboardPath)}
            className="mt-4 px-5 py-2 bg-white text-green-700 font-semibold rounded-xl hover:bg-green-50 transition-colors text-sm">
            Go to Dashboard →
          </button>
        </div>
      )}

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(plan => {
          const isCurrentPlan = activeSub?.status === 'active' && activeSub?.plan === plan.id;
          const isProcessing = processingPlan === plan.id;

          return (
            <div key={plan.id}
              className={`relative bg-white rounded-2xl border-2 overflow-hidden transition-all hover:shadow-lg ${
                plan.popular ? 'border-blue-500 shadow-md' : 'border-gray-200'
              }`}>
              <div className={`h-1.5 ${plan.popular ? 'bg-gradient-to-r from-blue-500 to-blue-700' : 'bg-gray-200'}`} />

              {plan.popular && (
                <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Best Value
                </div>
              )}

              <div className="p-7">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-500 mb-5">{plan.duration}</p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">₦{plan.price.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => !isCurrentPlan && !isProcessing && handleSubscribe(plan.id)}
                  disabled={isCurrentPlan || !!processingPlan}
                  className={`w-full py-3 px-6 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    isCurrentPlan
                      ? 'bg-green-100 text-green-700 cursor-default border border-green-200'
                      : plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm disabled:opacity-50'
                      : 'bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50'
                  }`}>
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Preparing payment...
                    </>
                  ) : isCurrentPlan ? (
                    '✓ Current Plan'
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Subscribe — ₦{plan.price.toLocaleString()}
                    </>
                  )}
                </button>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Test mode */}
      {process.env.REACT_APP_PAYSTACK_PUBLIC_KEY?.startsWith('pk_test') && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
          <strong>🧪 Test Mode:</strong> Use card{' '}
          <code className="bg-amber-100 px-1 rounded font-mono">4084 0840 8408 4081</code>,
          any future expiry, CVV <code className="bg-amber-100 px-1 rounded font-mono">408</code>
        </div>
      )}

      {/* How it works */}
      <div className="bg-gray-50 rounded-2xl p-7">
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {[
            { icon: '📋', title: 'Choose a Plan', desc: 'Select the subscription that fits your needs' },
            { icon: '💳', title: 'Secure Payment', desc: 'Pay safely via Paystack — card, bank transfer, or USSD' },
            { icon: '✅', title: 'Instant Access', desc: 'Your subscription activates immediately after payment' },
          ].map(s => (
            <div key={s.title} className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl mb-3">{s.icon}</div>
              <h3 className="font-bold text-gray-900 mb-1">{s.title}</h3>
              <p className="text-sm text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProviderSubscription;
