/**
 * Subscription Management Page
 */
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiCheck, FiX } from 'react-icons/fi';
import { hospitalApi } from '../services/api';
import type { Subscription } from '../types';
import { format } from 'date-fns';

const SubscriptionPage: React.FC = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const data = await hospitalApi.getSubscription();
      setSubscription(data);
    } catch (error: any) {
      toast.error('Failed to load subscription');
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      name: 'Basic',
      type: 'basic',
      price: 49.99,
      features: [
        '5 active job postings',
        '1 featured listing',
        'Basic analytics',
        'Email support',
      ],
    },
    {
      name: 'Premium',
      type: 'premium',
      price: 99.99,
      features: [
        '20 active job postings',
        '5 featured listings',
        'Advanced analytics',
        'Email & phone support',
        'Priority listing',
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      type: 'enterprise',
      price: 199.99,
      features: [
        'Unlimited job postings',
        '20 featured listings',
        'Custom reports',
        'Dedicated account manager',
        'API access',
        'Priority support',
      ],
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900">Subscription Management</h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage your subscription plan and billing
        </p>
      </div>

      {/* Current Subscription */}
      {subscription && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Current Subscription</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <dt className="text-sm font-medium text-gray-500">Plan</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">{subscription.plan_name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    subscription.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : subscription.status === 'expired'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {subscription.status}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Monthly Fee</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">
                ${subscription.monthly_fee.toFixed(2)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Job Posting Limit</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {subscription.job_posting_limit === null
                  ? 'Unlimited'
                  : `${subscription.remaining_job_posts} / ${subscription.job_posting_limit} remaining`}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Renewal Date</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {format(new Date(subscription.end_date), 'MMMM d, yyyy')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Auto Renew</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {subscription.auto_renew ? (
                  <span className="text-green-600">Enabled</span>
                ) : (
                  <span className="text-red-600">Disabled</span>
                )}
              </dd>
            </div>
          </div>
        </div>
      )}

      {/* Available Plans */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Available Plans</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.type}
              className={`relative bg-white rounded-lg shadow-lg overflow-hidden ${
                plan.popular ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-xs font-semibold rounded-bl-lg">
                  POPULAR
                </div>
              )}
              <div className="p-6">
                <h4 className="text-2xl font-bold text-gray-900">{plan.name}</h4>
                <p className="mt-4">
                  <span className="text-4xl font-extrabold text-gray-900">${plan.price}</span>
                  <span className="text-base font-medium text-gray-500">/month</span>
                </p>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <FiCheck className="flex-shrink-0 h-5 w-5 text-green-500" />
                      <span className="ml-3 text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => toast.info('Subscription upgrade coming soon!')}
                  disabled={subscription?.plan_type === plan.type}
                  className={`mt-8 w-full py-3 px-6 border border-transparent rounded-md text-center font-medium ${
                    subscription?.plan_type === plan.type
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {subscription?.plan_type === plan.type ? 'Current Plan' : 'Upgrade'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
