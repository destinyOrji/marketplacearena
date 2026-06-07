/**
 * Subscription Page — uses backend redirect flow (no react-paystack popup)
 * Flow: Subscribe → initialize-payment → redirect to Paystack → /payment/verify
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface SubscriptionPlan {
  id: string;
  name: string;
  duration: string;
  price: number;
  currency: string;
  savings?: number;
  popular?: boolean;
  features: string[];
}

interface ActiveSubscription {
  _id: string;
  plan: string;
  amount: number;
  status: string;
  startDate: string;
  endDate: string;
  paymentStatus: string;
  autoRenew: boolean;
}

const API_URL = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';

const Subscription: React.FC = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [activeSubscription, setActiveSubscription] = useState<ActiveSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const [plansRes, subRes] = await Promise.all([
        fetch(`${API_URL}/subscriptions/plans`),
        fetch(`${API_URL}/subscriptions/my-subscription`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const plansData = await plansRes.json();
      if (plansData.success) setPlans(plansData.data);
      const subData = await subRes.json();
      if (subData.success && subData.data) setActiveSubscription(subData.data);
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
      const token = localStorage.getItem('authToken');
      if (!token) {
        setMessage({ type: 'error', text: 'Please log in to subscribe.' });
        return;
      }

      // 1. Create subscription record (status: pending)
      const subRes = await fetch(`${API_URL}/subscriptions/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: planId }),
      });
      
      if (!subRes.ok) {
        const errorData = await subRes.json();
        setMessage({ type: 'error', text: errorData.message || 'Failed to create subscription.' });
        return;
      }

      const subData = await subRes.json();
      if (!subData.success) {
        setMessage({ type: 'error', text: subData.message || 'Failed to create subscription.' });
        return;
      }

      const subscriptionId = subData.data._id;

      // 2. Initialize Paystack transaction → get authorizationUrl
      const initRes = await fetch(`${API_URL}/subscriptions/initialize-payment/${subscriptionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });

      if (!initRes.ok) {
        const errorData = await initRes.json();
        setMessage({ type: 'error', text: errorData.message || 'Failed to initialize payment.' });
        return;
      }

      const initData = await initRes.json();
      if (!initData.success) {
        setMessage({ type: 'error', text: initData.message || 'Failed to initialize payment.' });
        return;
      }

      // 3. Redirect to Paystack hosted checkout (bypasses Cloudflare JS challenge)
      const authUrl = initData.data?.authorizationUrl || initData.data?.authorization_url;
      if (!authUrl) {
        setMessage({ type: 'error', text: 'No payment URL returned. Please try again.' });
        return;
      }

      // Store returnTo so PaymentVerify can redirect back after success
      const returnTo = sessionStorage.getItem('subscriptionReturnTo');
      if (!returnTo) {
        // If not set by SubscriptionGuard, default to dashboard
        sessionStorage.setItem('subscriptionReturnTo', '/patient/dashboard');
      }

      // Redirect to Paystack
      window.location.href = authUrl;
    } catch (err: any) {
      console.error('Subscription error:', err);
      setMessage({ type: 'error', text: err.message || 'An error occurred. Please try again.' });
    } finally {
      setProcessingPlan(null);
    }
  };

  const getDaysRemaining = () => {
    if (!activeSubscription) return 0;
    return Math.max(0, Math.ceil((new Date(activeSubscription.endDate).getTime() - Date.now()) / 86400000));
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* New-user prompt banner */}
      {!activeSubscription && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
          <div>
            <h2 className="text-xl font-bold mb-1">👋 Welcome to Health Market Arena!</h2>
            <p className="text-blue-100 text-sm leading-relaxed">
              To book appointments, access emergency services, and view your medical records,
              please choose a subscription plan below.
            </p>
          </div>
          <div className="flex-shrink-0">
            <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/30">
              Step required to continue
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Choose Your Plan</h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Subscribe to unlock unlimited appointment bookings, emergency services, and full access to your health records.
        </p>
      </div>

      {/* Status message */}
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
      {activeSubscription?.status === 'active' && (
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">✅</span>
                <h3 className="text-lg font-bold">Active Subscription</h3>
              </div>
              <p className="text-green-100 text-sm">Plan: <strong className="text-white capitalize">{activeSubscription.plan}</strong></p>
              <p className="text-green-100 text-sm mt-1">Valid until: <strong className="text-white">{formatDate(activeSubscription.endDate)}</strong></p>
              <p className="text-green-100 text-sm mt-1"><strong className="text-white">{getDaysRemaining()} days</strong> remaining</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-2xl px-5 py-3 text-center">
              <p className="text-3xl font-bold">{getDaysRemaining()}</p>
              <p className="text-xs text-green-100">days left</p>
            </div>
          </div>
        </div>
      )}

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(plan => {
          const isCurrentPlan = activeSubscription?.status === 'active' && activeSubscription?.plan === plan.id;
          const isProcessing = processingPlan === plan.id;

          return (
            <div key={plan.id}
              className={`relative bg-white rounded-2xl border-2 overflow-hidden transition-all hover:shadow-lg ${
                plan.popular ? 'border-blue-500 shadow-md' : 'border-gray-200'
              }`}>
              {/* Top accent */}
              <div className={`h-1.5 ${plan.popular ? 'bg-gradient-to-r from-blue-500 to-blue-700' : 'bg-gray-200'}`} />

              {plan.popular && (
                <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <div className="p-7">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-500 mb-5">{plan.duration}</p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">₦{plan.price.toLocaleString()}</span>
                  </div>
                  {plan.savings && (
                    <p className="text-green-600 text-sm font-semibold mt-1">
                      🎉 Save ₦{plan.savings.toLocaleString()}
                    </p>
                  )}
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

      {/* Test mode notice */}
      {process.env.REACT_APP_PAYSTACK_PUBLIC_KEY?.startsWith('pk_test') && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
          <strong>🧪 Test Mode:</strong> Use card{' '}
          <code className="bg-amber-100 px-1 rounded font-mono">4084 0840 8408 4081</code>,
          any future expiry, CVV <code className="bg-amber-100 px-1 rounded font-mono">408</code>
        </div>
      )}

      {/* How it works */}
      <div className="bg-gray-50 rounded-2xl p-7">
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">How Payment Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {[
            { step: '1', icon: '📋', title: 'Choose a Plan', desc: 'Select the subscription that fits your needs' },
            { step: '2', icon: '💳', title: 'Secure Payment', desc: 'Pay safely via Paystack — card, bank transfer, or USSD' },
            { step: '3', icon: '✅', title: 'Instant Access', desc: 'Your subscription activates immediately after payment' },
          ].map(s => (
            <div key={s.step} className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl mb-3">{s.icon}</div>
              <h3 className="font-bold text-gray-900 mb-1">{s.title}</h3>
              <p className="text-sm text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: '📅', title: 'Unlimited Bookings', desc: 'Book as many appointments as you need' },
          { icon: '🚑', title: 'Emergency Access', desc: '24/7 ambulance service availability' },
          { icon: '⚡', title: 'Priority Support', desc: 'Faster response from our team' },
          { icon: '📋', title: 'Medical Records', desc: 'Access your health records anytime' },
        ].map(b => (
          <div key={b.title} className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
            <div className="text-3xl mb-2">{b.icon}</div>
            <h3 className="text-sm font-bold text-gray-900 mb-1">{b.title}</h3>
            <p className="text-xs text-gray-500">{b.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Subscription;
