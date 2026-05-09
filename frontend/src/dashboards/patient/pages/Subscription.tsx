import React, { useState, useEffect, useCallback } from 'react';
import { usePaystackPayment } from 'react-paystack';

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

interface PaystackConfig {
  reference: string;
  email: string;
  amount: number; // in kobo
  publicKey: string;
  metadata?: {
    custom_fields: Array<{ display_name: string; variable_name: string; value: string }>;
    subscriptionId?: string;
  };
}

const API_URL = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';
const PAYSTACK_PUBLIC_KEY = process.env.REACT_APP_PAYSTACK_PUBLIC_KEY || '';

// ─── Inner component that holds the Paystack hook ────────────────────────────
// We need a separate component because usePaystackPayment requires its config
// at render time (it's a hook, not a callback).
interface PaystackButtonProps {
  config: PaystackConfig;
  label: string;
  disabled: boolean;
  className: string;
  onSuccess: (reference: string) => void;
  onClose: () => void;
}

const PaystackButton: React.FC<PaystackButtonProps> = ({
  config,
  label,
  disabled,
  className,
  onSuccess,
  onClose,
}) => {
  const initializePayment = usePaystackPayment(config);

  // Auto-open Paystack popup as soon as this component mounts
  React.useEffect(() => {
    if (!disabled) {
      initializePayment({
        onSuccess: (ref: any) => onSuccess(ref.reference || ref.trxref),
        onClose,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <button
      disabled={disabled}
      className={className}
      onClick={() =>
        initializePayment({
          onSuccess: (ref: any) => onSuccess(ref.reference || ref.trxref),
          onClose,
        })
      }
    >
      {label}
    </button>
  );
};

// ─── Main Subscription page ───────────────────────────────────────────────────
const Subscription: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [activeSubscription, setActiveSubscription] = useState<ActiveSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Paystack config state — populated just before opening the popup
  const [paystackConfig, setPaystackConfig] = useState<PaystackConfig | null>(null);
  const [pendingSubscriptionId, setPendingSubscriptionId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

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
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Create the subscription record, then initialize Paystack
  const handleSubscribe = async (planId: string) => {
    try {
      setSubscribing(true);
      setSelectedPlan(planId);
      setMessage(null);

      const token = localStorage.getItem('authToken');

      // 1. Create subscription (status: pending)
      const subRes = await fetch(`${API_URL}/subscriptions/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: planId }),
      });
      const subData = await subRes.json();

      if (!subData.success) {
        setMessage({ type: 'error', text: subData.message || 'Failed to create subscription.' });
        return;
      }

      const subscriptionId = subData.data._id;

      // 2. Initialize Paystack transaction on the backend
      const initRes = await fetch(
        `${API_URL}/subscriptions/initialize-payment/${subscriptionId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const initData = await initRes.json();

      if (!initData.success) {
        setMessage({ type: 'error', text: initData.message || 'Failed to initialize payment.' });
        return;
      }

      // 3. Get user email for Paystack popup
      const userStr = localStorage.getItem('user');
      const userEmail = userStr ? JSON.parse(userStr).email : '';

      // 4. Set config — this triggers re-render of PaystackButton with correct config
      const plan = plans.find((p) => p.id === planId);
      setPendingSubscriptionId(subscriptionId);
      setPaystackConfig({
        reference: initData.data.reference,
        email: userEmail,
        amount: (plan?.price || 0) * 100, // kobo
        publicKey: PAYSTACK_PUBLIC_KEY,
        metadata: {
          custom_fields: [
            {
              display_name: 'Subscription ID',
              variable_name: 'subscription_id',
              value: subscriptionId,
            },
          ],
          subscriptionId,
        },
      });
    } catch (error) {
      console.error('Subscription error:', error);
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setSubscribing(false);
    }
  };

  // Step 2: Called by Paystack popup on success
  const handlePaymentSuccess = useCallback(
    async (reference: string) => {
      try {
        setMessage(null);
        const token = localStorage.getItem('authToken');

        const verifyRes = await fetch(
          `${API_URL}/subscriptions/verify-payment/${reference}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const verifyData = await verifyRes.json();

        if (verifyData.success) {
          setMessage({ type: 'success', text: '🎉 Subscription activated successfully!' });
          fetchData();
        } else {
          setMessage({
            type: 'error',
            text: verifyData.message || 'Payment verification failed.',
          });
        }
      } catch (err) {
        console.error('Verification error:', err);
        setMessage({ type: 'error', text: 'Could not verify payment. Contact support.' });
      } finally {
        setPaystackConfig(null);
        setPendingSubscriptionId(null);
        setSelectedPlan(null);
      }
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handlePaymentClose = useCallback(() => {
    setMessage({ type: 'error', text: 'Payment window closed. You can try again.' });
    setPaystackConfig(null);
    setPendingSubscriptionId(null);
    setSelectedPlan(null);
    setSubscribing(false);
  }, []);

  const getDaysRemaining = () => {
    if (!activeSubscription) return 0;
    const diffMs = new Date(activeSubscription.endDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Subscription Plan</h1>
        <p className="text-lg text-gray-600">
          Subscribe to access all features including booking appointments and emergency services
        </p>
      </div>

      {/* Status message */}
      {message && (
        <div
          className={`mb-6 px-5 py-4 rounded-lg text-sm font-medium ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Active Subscription Banner */}
      {activeSubscription && activeSubscription.status === 'active' && (
        <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">Active Subscription</h3>
              <p className="text-green-700">
                Plan: <span className="font-medium">{activeSubscription.plan}</span>
              </p>
              <p className="text-green-700">
                Valid until:{' '}
                <span className="font-medium">{formatDate(activeSubscription.endDate)}</span>
              </p>
              <p className="text-green-700">
                Days remaining:{' '}
                <span className="font-medium">{getDaysRemaining()} days</span>
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
        {plans.map((plan) => {
          const isCurrentPlan =
            activeSubscription?.status === 'active' && activeSubscription?.plan === plan.id;
          const isProcessing = subscribing && selectedPlan === plan.id;

          const buttonLabel = isProcessing
            ? 'Preparing...'
            : isCurrentPlan
            ? 'Current Plan'
            : 'Subscribe Now';

          const buttonClass = `w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
            isCurrentPlan
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : plan.popular
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-900 text-white hover:bg-gray-800'
          }`;

          return (
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
                  <span className="text-4xl font-bold text-gray-900">
                    ₦{plan.price.toLocaleString()}
                  </span>
                  {plan.savings && (
                    <p className="text-green-600 font-medium mt-2">
                      Save ₦{plan.savings.toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Show Paystack button only when config is ready for this plan */}
                {paystackConfig && selectedPlan === plan.id ? (
                  <PaystackButton
                    config={paystackConfig}
                    label="Pay Now"
                    disabled={false}
                    className={buttonClass.replace('cursor-not-allowed', '')}
                    onSuccess={handlePaymentSuccess}
                    onClose={handlePaymentClose}
                  />
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={subscribing || isCurrentPlan}
                    className={buttonClass}
                  >
                    {buttonLabel}
                  </button>
                )}

                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Test mode notice */}
      {PAYSTACK_PUBLIC_KEY.startsWith('pk_test') && (
        <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          <strong>🧪 Test Mode:</strong> Use Paystack test card{' '}
          <code className="bg-yellow-100 px-1 rounded">4084 0840 8408 4081</code>, any future
          expiry, and CVV <code className="bg-yellow-100 px-1 rounded">408</code> to simulate a
          successful payment.
        </div>
      )}

      {/* Benefits Section */}
      <div className="bg-gray-50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Subscribe?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              color: 'blue',
              icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
              title: 'Unlimited Bookings',
              desc: 'Book as many appointments as you need',
            },
            {
              color: 'red',
              icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
              title: 'Emergency Access',
              desc: '24/7 emergency service availability',
            },
            {
              color: 'green',
              icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
              title: 'Priority Support',
              desc: 'Get faster response from our team',
            },
            {
              color: 'purple',
              icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
              title: 'Medical Records',
              desc: 'Access your health records anytime',
            },
          ].map(({ color, icon, title, desc }) => (
            <div key={title} className="text-center">
              <div
                className={`bg-${color}-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}
              >
                <svg
                  className={`w-8 h-8 text-${color}-600`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-600 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Subscription;
