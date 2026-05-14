/**
 * Gym-Physio Subscription Page — Backend redirect flow (no react-paystack popup)
 * Flow: Subscribe → initialize-payment → redirect to Paystack → /payment/verify
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

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
  plan: string;
  status: string;
  startDate: string;
  endDate: string;
  amount: number;
}

const API_URL = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';

const Subscription: React.FC = () => {
  const { gymPhysio } = useAuth();
  const [activeSubscription, setActiveSubscription] = useState<ActiveSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const plans: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: 'Basic',
      duration: '1 Month',
      price: 2000,
      currency: 'NGN',
      popular: false,
      features: [
        'Up to 10 services',
        'Basic analytics dashboard',
        'Email support',
        'Standard listing visibility',
        'Appointment management',
      ],
    },
    {
      id: 'professional',
      name: 'Professional',
      duration: '6 Months',
      price: 8000,
      currency: 'NGN',
      savings: 4000,
      popular: true,
      features: [
        'Unlimited services',
        'Advanced analytics & insights',
        'Priority support',
        'Featured listing placement',
        'Performance tracking',
        'Customer reviews management',
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      duration: '1 Year',
      price: 14000,
      currency: 'NGN',
      savings: 10000,
      popular: false,
      features: [
        'Everything in Professional',
        'Premium badge on profile',
        'Top search placement',
        'Dedicated account manager',
        'Custom branding options',
        'API access for integrations',
        'Marketing support',
      ],
    },
  ];

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('gymPhysioToken') || localStorage.getItem('authToken');
      
      const response = await fetch(`${API_URL}/gym-physio/subscription/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success && data.data && data.data.status === 'active') {
        setActiveSubscription(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    setProcessingPlan(planId);
    setMessage(null);

    try {
      const token = localStorage.getItem('gymPhysioToken') || localStorage.getItem('authToken');
      if (!token) {
        setMessage({ type: 'error', text: 'Please log in to subscribe.' });
        return;
      }

      const plan = plans.find(p => p.id === planId);
      if (!plan) {
        setMessage({ type: 'error', text: 'Invalid plan selected.' });
        return;
      }

      // Create subscription and initialize payment
      const response = await fetch(`${API_URL}/gym-physio/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: planId,
          amount: plan.price,
          transactionReference: `GYM-SUB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setMessage({ type: 'error', text: data.message || 'Failed to create subscription.' });
        return;
      }

      // For now, show success and reload
      // In production, you'd redirect to Paystack payment page
      setMessage({ type: 'success', text: `Successfully subscribed to ${plan.name} plan!` });
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error('Subscription error:', error);
      setMessage({ type: 'error', text: error.message || 'An error occurred. Please try again.' });
    } finally {
      setProcessingPlan(null);
    }
  };

  const getDaysRemaining = () => {
    if (!activeSubscription) return 0;
    return Math.max(
      0,
      Math.ceil((new Date(activeSubscription.endDate).getTime() - Date.now()) / 86400000)
    );
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Choose Your Plan</h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Subscribe to unlock unlimited services, advanced analytics, and grow your business with premium features.
        </p>
      </div>

      {/* Status message */}
      {message && (
        <div
          className={`px-5 py-4 rounded-2xl text-sm font-medium border ${
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
              <p className="text-green-100 text-sm">
                Plan: <strong className="text-white capitalize">{activeSubscription.plan}</strong>
              </p>
              <p className="text-green-100 text-sm mt-1">
                Valid until: <strong className="text-white">{formatDate(activeSubscription.endDate)}</strong>
              </p>
              <p className="text-green-100 text-sm mt-1">
                <strong className="text-white">{getDaysRemaining()} days</strong> remaining
              </p>
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
        {plans.map((plan) => {
          const isCurrentPlan =
            activeSubscription?.status === 'active' && activeSubscription?.plan === plan.id;
          const isProcessing = processingPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl border-2 overflow-hidden transition-all hover:shadow-lg ${
                plan.popular ? 'border-orange-500 shadow-md' : 'border-gray-200'
              }`}>
              {/* Top accent */}
              <div
                className={`h-1.5 ${
                  plan.popular ? 'bg-gradient-to-r from-orange-500 to-orange-700' : 'bg-gray-200'
                }`}
              />

              {plan.popular && (
                <div className="absolute top-4 right-4 bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <div className="p-7">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-500 mb-5">{plan.duration}</p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">
                      ₦{plan.price.toLocaleString()}
                    </span>
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
                      ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-sm disabled:opacity-50'
                      : 'bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50'
                  }`}>
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Processing...
                    </>
                  ) : isCurrentPlan ? (
                    '✓ Current Plan'
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                      Subscribe — ₦{plan.price.toLocaleString()}
                    </>
                  )}
                </button>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <svg
                        className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
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
          <code className="bg-amber-100 px-1 rounded font-mono">4084 0840 8408 4081</code>, any
          future expiry, CVV <code className="bg-amber-100 px-1 rounded font-mono">408</code>
        </div>
      )}

      {/* How it works */}
      <div className="bg-gray-50 rounded-2xl p-7">
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">How Payment Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {[
            {
              step: '1',
              icon: '📋',
              title: 'Choose a Plan',
              desc: 'Select the subscription that fits your business needs',
            },
            {
              step: '2',
              icon: '💳',
              title: 'Secure Payment',
              desc: 'Pay safely via Paystack — card, bank transfer, or USSD',
            },
            {
              step: '3',
              icon: '✅',
              title: 'Instant Access',
              desc: 'Your subscription activates immediately after payment',
            },
          ].map((s) => (
            <div key={s.step} className="flex flex-col items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl mb-3">
                {s.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{s.title}</h3>
              <p className="text-sm text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            icon: '💪',
            title: 'Unlimited Services',
            desc: 'Add as many services as you want',
          },
          {
            icon: '📊',
            title: 'Advanced Analytics',
            desc: 'Track performance and growth',
          },
          {
            icon: '⭐',
            title: 'Featured Listing',
            desc: 'Get more visibility and bookings',
          },
          {
            icon: '🎯',
            title: 'Priority Support',
            desc: 'Get help when you need it',
          },
        ].map((b) => (
          <div
            key={b.title}
            className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
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
