/**
 * Professional Subscription Page
 *
 * Flow:
 *   1. Fetch plans  GET /subscriptions/provider/plans?role=professional
 *   2. Fetch status GET /subscriptions/provider/status
 *   3. Subscribe    POST /subscriptions/provider/subscribe  { planId }
 *   4. Init payment POST /subscriptions/provider/initialize-payment/:id
 *   5. Redirect     → Paystack → /provider-payment/verify → back to dashboard
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

interface Plan {
  id: string;
  name: string;
  duration: string;
  durationMonths: number;
  price: number;
  features: string[];
  popular?: boolean;
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
  autoRenew: boolean;
}

const API_URL = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });

const daysLeft = (endDate: string) =>
  Math.max(0, Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000));

// ─── Plan card ────────────────────────────────────────────────────────────────

const PlanCard: React.FC<{
  plan: Plan;
  processing: boolean;
  onSelect: (id: string) => void;
}> = ({ plan, processing, onSelect }) => (
  <div
    className={`relative flex flex-col rounded-2xl border-2 p-6 transition-shadow hover:shadow-lg ${
      plan.popular
        ? 'border-blue-600 shadow-blue-100 shadow-md'
        : 'border-gray-200'
    }`}
  >
    {plan.popular && (
      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow">
        Most Popular
      </span>
    )}

    <div className="mb-4">
      <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
      <p className="text-sm text-gray-500 mt-0.5">{plan.duration === 'monthly' ? '1 month' : plan.duration === '6-months' ? '6 months' : '12 months'}</p>
    </div>

    <div className="mb-5">
      <span className="text-4xl font-extrabold text-gray-900">{fmt(plan.price)}</span>
      <span className="text-sm text-gray-500 ml-1">
        / {plan.durationMonths === 1 ? 'month' : `${plan.durationMonths} months`}
      </span>
    </div>

    <ul className="space-y-2 mb-6 flex-1">
      {(Array.isArray(plan.features)
        ? plan.features
        : Object.entries(plan.features || {}).filter(([, v]) => v).map(([k]) =>
            k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())
          )
      ).map(f => (
        <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
          <svg className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {f}
        </li>
      ))}
    </ul>

    <button
      onClick={() => onSelect(plan.id)}
      disabled={processing}
      className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 ${
        plan.popular
          ? 'bg-blue-600 hover:bg-blue-700 text-white'
          : 'bg-gray-900 hover:bg-gray-800 text-white'
      }`}
    >
      {processing ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Processing…
        </span>
      ) : (
        `Get ${plan.name}`
      )}
    </button>
  </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────

const ProfessionalSubscription: React.FC = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [activeSub, setActiveSub] = useState<ActiveSub | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token =
    localStorage.getItem('professionalToken') ||
    localStorage.getItem('authToken') || '';

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, statusRes] = await Promise.all([
        fetch(`${API_URL}/subscriptions/provider/plans?role=professional`),
        fetch(`${API_URL}/subscriptions/provider/status`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const plansJson = await plansRes.json();
      if (plansJson.success) setPlans(plansJson.data);

      const statusJson = await statusRes.json();
      if (statusJson.success && statusJson.data?.subscription) {
        setActiveSub(statusJson.data.subscription);
      }
    } catch {
      setError('Failed to load subscription information.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (planId: string) => {
    setProcessing(planId);
    setError('');
    setSuccess('');

    try {
      // 1. Create subscription record
      const subRes = await fetch(`${API_URL}/subscriptions/provider/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ planId }),
      });
      const subJson = await subRes.json();
      if (!subJson.success) {
        setError(subJson.message || 'Failed to create subscription.');
        return;
      }

      const subscriptionId = subJson.data._id;

      // 2. Initialize Paystack payment
      const initRes = await fetch(
        `${API_URL}/subscriptions/provider/initialize-payment/${subscriptionId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        }
      );
      const initJson = await initRes.json();
      if (!initJson.success) {
        setError(initJson.message || 'Failed to initialize payment.');
        return;
      }

      const authUrl =
        initJson.data?.authorizationUrl ||
        initJson.data?.authorization_url;

      if (!authUrl) {
        setError('No payment URL returned. Please try again.');
        return;
      }

      // Save where to return after payment
      const returnTo =
        sessionStorage.getItem('professionalSubscriptionReturnTo') ||
        '/professional/dashboard';
      sessionStorage.setItem('professionalSubscriptionReturnTo', returnTo);

      window.location.href = authUrl;
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* Welcome banner — shown only when no active subscription */}
        {!activeSub && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
            <div>
              <h2 className="text-xl font-bold mb-1">👋 Welcome to Health Market Arena!</h2>
              <p className="text-blue-100 text-sm leading-relaxed">
                Subscribe to list your services, accept appointments, and start earning from your practice.
              </p>
            </div>
            <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/30 flex-shrink-0">
              Required to continue
            </span>
          </div>
        )}

        {/* Active subscription card */}
        {activeSub && (
          <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-green-600 text-xl">✓</span>
                  <h3 className="text-lg font-bold text-green-900">Active Subscription</h3>
                </div>
                <p className="text-green-800 text-sm">
                  Plan: <strong>{activeSub.planName || activeSub.plan}</strong>
                  &ensp;·&ensp;
                  {daysLeft(activeSub.endDate)} days remaining
                  &ensp;·&ensp;
                  Renews {fmtDate(activeSub.endDate)}
                </p>
              </div>
              <button
                onClick={() => navigate('/professional/dashboard')}
                className="flex-shrink-0 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Go to Dashboard →
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {activeSub ? 'Renew or Upgrade Your Plan' : 'Choose a Plan'}
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto text-sm">
            Get listed on Health Market Arena and start accepting patients. Cancel anytime.
          </p>
        </div>

        {/* Error / success */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700">{success}</div>
        )}

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {plans.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              processing={processing === plan.id}
              onSelect={handleSelect}
            />
          ))}
        </div>

        {/* What's included summary */}
        <div className="bg-gray-50 rounded-2xl p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Every plan includes:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              'List your services publicly',
              'Accept patient appointment bookings',
              'Manage your schedule & availability',
              'Patient records & session notes',
              'Earnings dashboard',
              'Job application access',
            ].map(item => (
              <div key={item} className="flex items-center gap-2 text-sm text-gray-700">
                <svg className="h-4 w-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Skip for now (goes to dashboard only) */}
        {!activeSub && (
          <p className="text-center text-sm text-gray-400">
            Want to look around first?{' '}
            <button
              onClick={() => navigate('/professional/dashboard')}
              className="text-blue-600 hover:underline font-medium"
            >
              Go to dashboard
            </button>
            {' '}(some features will be locked)
          </p>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProfessionalSubscription;
