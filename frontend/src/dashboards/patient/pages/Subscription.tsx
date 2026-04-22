import React, { useState, useEffect } from 'react';
import api from '../services/api';

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

const Subscription: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [activeSubscription, setActiveSubscription] = useState<ActiveSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const API_URL = import.meta.env.VITE_API_URL || 'https://healthmarketarena.com/api/v1';
      
      // Fetch plans
      const plansResponse = await fetch(`${API_URL}/subscriptions/plans`);
      const plansData = await plansResponse.json();
      if (plansData.success) {
        setPlans(plansData.data);
      }

      // Fetch active subscription
      const token = localStorage.getItem('authToken');
      const subResponse = await fetch(`${API_URL}/subscriptions/my-subscription`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const subData = await subResponse.json();
      if (subData.success && subData.data) {
        setActiveSubscription(subData.data);
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      setSubscribing(true);
      setSelectedPlan(planId);

      const token = localStorage.getItem('authToken');
      const API_URL = import.meta.env.VITE_API_URL || 'https://healthmarketarena.com/api/v1';
      
      // Create subscription
      const response = await fetch(`${API_URL}/subscriptions/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ plan: planId })
      });

      const data = await response.json();

      if (data.success) {
        // Simulate payment completion (in production, integrate with payment gateway)
        const paymentResponse = await fetch(
          `${API_URL}/subscriptions/complete-payment/${data.data._id}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ paymentReference: `PAY-${Date.now()}` })
          }
        );

        const paymentData = await paymentResponse.json();

        if (paymentData.success) {
          alert('Subscription activated successfully!');
          fetchData();
        } else {
          alert(paymentData.message || 'Payment failed');
        }
      } else {
        alert(data.message || 'Subscription failed');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setSubscribing(false);
      setSelectedPlan(null);
    }
  };

  const getDaysRemaining = () => {
    if (!activeSubscription) return 0;
    const endDate = new Date(activeSubscription.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Subscription Plan
        </h1>
        <p className="text-lg text-gray-600">
          Subscribe to access all features including booking appointments and emergency services
        </p>
      </div>

      {/* Active Subscription Banner */}
      {activeSubscription && activeSubscription.status === 'active' && (
        <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Active Subscription
              </h3>
              <p className="text-green-700">
                Plan: <span className="font-medium">{activeSubscription.plan}</span>
              </p>
              <p className="text-green-700">
                Valid until: <span className="font-medium">{formatDate(activeSubscription.endDate)}</span>
              </p>
              <p className="text-green-700">
                Days remaining: <span className="font-medium">{getDaysRemaining()} days</span>
              </p>
            </div>
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
              Active
            </div>
          </div>
        </div>
      )}

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-transform hover:scale-105 ${
              plan.popular ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 text-sm font-medium rounded-bl-lg">
                Most Popular
              </div>
            )}

            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-gray-600 mb-6">{plan.duration}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">₦{plan.price.toLocaleString()}</span>
                {plan.savings && (
                  <p className="text-green-600 font-medium mt-2">
                    Save ₦{plan.savings.toLocaleString()}
                  </p>
                )}
              </div>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={
                  subscribing ||
                  (activeSubscription?.status === 'active' && activeSubscription?.plan === plan.id)
                }
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  activeSubscription?.status === 'active' && activeSubscription?.plan === plan.id
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {subscribing && selectedPlan === plan.id
                  ? 'Processing...'
                  : activeSubscription?.status === 'active' && activeSubscription?.plan === plan.id
                  ? 'Current Plan'
                  : 'Subscribe Now'}
              </button>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Benefits Section */}
      <div className="bg-gray-50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Why Subscribe?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Unlimited Bookings</h3>
            <p className="text-gray-600 text-sm">Book as many appointments as you need</p>
          </div>

          <div className="text-center">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Emergency Access</h3>
            <p className="text-gray-600 text-sm">24/7 emergency service availability</p>
          </div>

          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Priority Support</h3>
            <p className="text-gray-600 text-sm">Get faster response from our team</p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Medical Records</h3>
            <p className="text-gray-600 text-sm">Access your health records anytime</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
