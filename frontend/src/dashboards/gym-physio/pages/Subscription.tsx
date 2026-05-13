/**
 * Gym-Physio Subscription Page
 * Provider subscription plans for gym and physiotherapy businesses
 */
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface SubscriptionPlan {
  id: string;
  name: string;
  duration: string;
  price: number;
  durationMonths: number;
  popular?: boolean;
  features: string[];
}

interface ActiveSubscription {
  _id: string;
  plan: string;
  planName: string;
  amount: number;
  status: string;
  startDate: string;
  endDate: string;
  paymentStatus: string;
  providerType: string;
}

const API_URL = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';

const Subscription: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [activeSubscription, setActiveSubscription] = useState<ActiveSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('gymPhysioToken') || localStorage.getItem('authToken');
      
      // Fetch plans for gym-physio
      const plansRes = await fetch(`${API_URL}/subscriptions/provider/plans?role=gym-physio`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const plansData = await plansRes.json();
      if (plansData.success) setPlans(plansData.data);

      // Fetch active subscription
      const subRes = await fetch(`${API_URL}/subscriptions/provider/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const subData = await subRes.json();
      if (subData.success && subData.data.subscription) {
        setActiveSubscription(subData.data.subscription);
      }
    } catch (error) {
      console.error('Failed to load subscription data:', error);
      setMessage({ type: 'error', text: 'Failed to load subscription data.' });
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

      // 1. Create subscription record
      const subRes = await fetch(`${API_URL}/subscriptions/provider/subscribe`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ planId }),
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

      // 2. Initialize Paystack payment
      const initRes = await fetch(`${API_URL}/subscriptions/provider/initialize-payment/${subscriptionId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
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

      // 3. Redirect to Paystack
      const authUrl = initData.data?.authorizationUrl || initData.data?.authorization_url;
      if (!authUrl) {
        setMessage({ type: 'error', text: 'No payment URL returned. Please try again.' });
        return;
      }

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
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Subscription Plans</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Choose a plan to list your services, accept bookings, and grow your business on Health Market Arena.
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
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">✅</span>
                <h3 className="text-lg font-bold">Active Subscription</h3>
              </div>
              <p className="text-orange-100 text-sm">
                Plan: <strong className="text-white capitalize">{activeSubscription.planName || activeSubscription.plan}</strong>
              </p>
              <p className="text-orange-100 text-sm mt-1">
                Valid until: <strong className="text-white">{formatDate(activeSubscription.endDate)}</strong>
              </p>
              <p className="text-orange-100 text-sm mt-1">
                <strong className="text-white">{getDaysRemaining()} days</strong> remaining
              </p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-2xl px-5 py-3 text-center">
              <p className="text-3xl font-bold">{getDaysRemaining()}</p>
              <p className="text-xs text-orange-100">days left</p>
            </div>
          </div>
        </div>
      )}

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(plan => {
          const isCurrentPlan = activeSubscription?.status === 'active' && 
            (activeSubscription?.plan === plan.id || activeSubscription?.planName === plan.name);
          const isProcessing = processingPlan === plan.id;

          return (
            <div key={plan.id}
              className={`relative bg-white rounded-2xl border-2 overflow-hidden transition-all hover:shadow-lg ${
                plan.popular ? 'border-orange-500 shadow-md' : 'border-gray-200'
              }`}>
              {/* Top accent */}
              <div className={`h-1.5 ${plan.popular ? 'bg-gradient-to-r from-orange-500 to-orange-700' : 'bg-gray-200'}`} />

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
                    <span className="text-4xl font-bold text-gray-900">₦{plan.price.toLocaleString()}</span>
                  </div>
                  {plan.id.includes('6months') && (
                    <p className="text-green-600 text-sm font-semibold mt-1">
                      🎉 Save ₦5,000
                    </p>
                  )}
                  {plan.id.includes('yearly') && (
                    <p className="text-green-600 text-sm font-semibold mt-1">
                      🎉 Save ₦20,000
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

      {/* Benefits Section */}
      <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-8 border border-orange-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Subscribe?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { icon: '🎯', title: 'Reach More Clients', desc: 'Get discovered by patients looking for gym and physiotherapy services' },
            { icon: '📅', title: 'Manage Bookings', desc: 'Accept and manage client appointments seamlessly' },
            { icon: '💰', title: 'Grow Revenue', desc: 'Increase your bookings and grow your business' },
            { icon: '📊', title: 'Track Analytics', desc: 'Monitor your performance with detailed analytics' },
          ].map((benefit, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl">
                {benefit.icon}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Test mode notice */}
      {process.env.REACT_APP_PAYSTACK_PUBLIC_KEY?.startsWith('pk_test') && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
          <strong>🧪 Test Mode:</strong> Use card{' '}
          <code className="bg-amber-100 px-1 rounded font-mono">4084 0840 8408 4081</code>,
          any future expiry, CVV <code className="bg-amber-100 px-1 rounded font-mono">408</code>
        </div>
      )}

      {/* FAQ */}
      <div className="bg-white rounded-2xl p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: 'Can I cancel my subscription?', a: 'Yes, you can cancel anytime. Your subscription will remain active until the end of the billing period.' },
            { q: 'What payment methods do you accept?', a: 'We accept all major debit and credit cards through our secure payment partner, Paystack.' },
            { q: 'Can I upgrade my plan?', a: 'Yes, you can upgrade to a higher plan at any time. The price difference will be prorated.' },
            { q: 'Do you offer refunds?', a: 'Refunds are available within 7 days of purchase if you haven\'t used the service.' },
          ].map((faq, i) => (
            <div key={i} className="border-b border-gray-100 pb-4 last:border-0">
              <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
              <p className="text-sm text-gray-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Subscription;
