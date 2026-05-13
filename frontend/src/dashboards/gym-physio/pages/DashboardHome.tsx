import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardStats } from '../services/api';

const DashboardHome: React.FC = () => {
  const { gymPhysio } = useAuth();
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  useEffect(() => {
    getDashboardStats()
      .then(d => setStats(d || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const name = gymPhysio?.businessName || 'My Business';
  const isVerified = gymPhysio?.isVerified || stats.isVerified;
  const subscription = gymPhysio?.subscription || { plan: 'none', status: 'inactive' };

  const subscriptionPlans = [
    {
      name: 'Basic',
      price: 2000,
      period: 'month',
      features: [
        'Up to 10 services',
        'Basic analytics',
        'Email support',
        'Standard listing',
      ],
      color: 'from-gray-500 to-gray-700',
      recommended: false,
    },
    {
      name: 'Professional',
      price: 8000,
      period: '6 months',
      monthlyPrice: 1333,
      features: [
        'Unlimited services',
        'Advanced analytics',
        'Priority support',
        'Featured listing',
        'Performance insights',
      ],
      color: 'from-blue-500 to-blue-700',
      recommended: true,
    },
    {
      name: 'Premium',
      price: 14000,
      period: 'year',
      monthlyPrice: 1167,
      features: [
        'Everything in Professional',
        'Premium badge',
        'Top search placement',
        'Dedicated account manager',
        'Custom branding',
        'API access',
      ],
      color: 'from-orange-500 to-orange-700',
      recommended: false,
    },
  ];

  const statCards = [
    {
      label: 'Active Services',
      value: stats.activeServices ?? 0,
      emoji: '💪',
      color: 'from-orange-500 to-orange-700',
      to: '/gym-physio/services',
    },
    {
      label: 'Upcoming Appointments',
      value: stats.upcomingAppointments ?? 0,
      emoji: '📅',
      color: 'from-blue-500 to-blue-700',
      to: '/gym-physio/appointments',
    },
    {
      label: 'Completed Sessions',
      value: stats.completedBookings ?? 0,
      emoji: '✅',
      color: 'from-green-500 to-green-700',
      to: '/gym-physio/appointments',
    },
    {
      label: 'Completion Rate',
      value: `${stats.completionRate ?? 0}%`,
      emoji: '📊',
      color: 'from-teal-500 to-teal-700',
      to: '/gym-physio/analytics',
    },
    {
      label: 'Average Rating',
      value: (stats.averageRating || 0).toFixed(1),
      emoji: '⭐',
      color: 'from-yellow-500 to-yellow-700',
      to: '/gym-physio/analytics',
    },
    {
      label: 'Total Reviews',
      value: stats.totalReviews ?? 0,
      emoji: '💬',
      color: 'from-purple-500 to-purple-700',
      to: '/gym-physio/analytics',
    },
  ];

  const quickActions = [
    { to: '/gym-physio/services', label: 'Add Service', emoji: '➕' },
    { to: '/gym-physio/appointments', label: 'Appointments', emoji: '📅' },
    { to: '/gym-physio/schedule', label: 'Set Schedule', emoji: '⏰' },
    { to: '/gym-physio/profile', label: 'Edit Profile', emoji: '👤' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-700 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Welcome back, {name} 👋</h1>
            <p className="opacity-80 text-sm">
              {gymPhysio?.businessType || 'Gym/Physio'} &bull;{' '}
              <span className={isVerified ? 'text-green-300' : 'text-yellow-300'}>
                {isVerified ? '✓ Verified' : '⏳ Pending Verification'}
              </span>
            </p>
            {subscription.status === 'active' && (
              <p className="text-sm mt-2 opacity-90">
                📦 {subscription.plan?.charAt(0).toUpperCase() + subscription.plan?.slice(1)} Plan Active
              </p>
            )}
          </div>
          <button
            onClick={() => setShowSubscriptionModal(true)}
            className="px-4 py-2 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-semibold text-sm whitespace-nowrap">
            {subscription.status === 'active' ? 'Upgrade Plan' : '⭐ Subscribe'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? [...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl bg-gray-200 animate-pulse h-28" />
            ))
          : statCards.map(({ label, value, emoji, color, to }) => (
              <Link key={label} to={to}
                className={`bg-gradient-to-br ${color} rounded-xl p-6 text-white shadow-sm hover:shadow-lg transition-shadow`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium opacity-90">{label}</p>
                  <span className="text-2xl">{emoji}</span>
                </div>
                <p className="text-3xl font-bold">{value}</p>
              </Link>
            ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {quickActions.map(({ to, label, emoji }) => (
            <Link key={to} to={to}
              className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors text-center">
              <span className="text-2xl">{emoji}</span>
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Verification Notice */}
      {!isVerified && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-yellow-900">Verification Pending</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Your account is pending admin verification. Complete your profile to speed up the process.
              </p>
              <Link to="/gym-physio/profile" className="inline-block mt-2 text-sm text-orange-600 font-medium hover:underline">
                Complete Profile →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-5xl w-full p-6 sm:p-8 my-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
                <p className="text-sm text-gray-500 mt-1">Select the perfect plan for your business</p>
              </div>
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {subscriptionPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl border-2 p-6 transition-all hover:shadow-lg ${
                    plan.recommended
                      ? 'border-blue-500 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  {plan.recommended && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        RECOMMENDED
                      </span>
                    </div>
                  )}

                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                    <span className="text-2xl">
                      {plan.name === 'Basic' ? '📦' : plan.name === 'Professional' ? '⭐' : '👑'}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-gray-900">₦{plan.price.toLocaleString()}</span>
                      <span className="text-gray-500 text-sm">/{plan.period}</span>
                    </div>
                    {plan.monthlyPrice && (
                      <p className="text-xs text-gray-500 mt-1">
                        ₦{plan.monthlyPrice.toLocaleString()}/month
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => {
                      // TODO: Implement subscription logic
                      alert(`Subscribing to ${plan.name} plan - ₦${plan.price.toLocaleString()}`);
                      setShowSubscriptionModal(false);
                    }}
                    className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                      plan.recommended
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}>
                    Choose {plan.name}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-900">
                <strong>💡 Note:</strong> All plans include secure payment processing, customer support, and regular platform updates. Cancel anytime.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;
