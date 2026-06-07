/**
 * SubscriptionGuard
 *
 * Wraps routes that require an active subscription.
 * On first render it checks /subscriptions/status:
 *   - No active subscription → redirects to /patient/subscription
 *   - Active subscription   → renders children normally
 *   - API error / loading   → renders children (fail-open so a network hiccup
 *                             doesn't lock the user out)
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../services/apiClient';

// Pages that are always accessible regardless of subscription status
const EXEMPT_PATHS = [
  '/patient/subscription',
  '/patient/dashboard',
  '/patient/profile',
  '/patient/notifications',
];

interface Props {
  children: React.ReactNode;
}

const SubscriptionGuard: React.FC<Props> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't check on exempt paths — render immediately
  const isExempt = EXEMPT_PATHS.some(p => location.pathname.startsWith(p));
  const [checked, setChecked] = useState(isExempt);

  useEffect(() => {
    if (isExempt) { setChecked(true); return; }

    let cancelled = false;

    apiClient
      .get('/subscriptions/status')
      .then(res => {
        if (cancelled) return;
        const data = res.data?.data ?? res.data ?? {};
        const active =
          data.hasActiveSubscription === true ||
          data.isActive === true ||
          data.status === 'active';

        if (!active) {
          // Save intended destination so Subscription page can redirect back
          sessionStorage.setItem('subscriptionReturnTo', location.pathname + location.search);
          navigate('/patient/subscription', { replace: true });
        } else {
          setChecked(true);
        }
      })
      .catch(() => {
        // Network error / 401 — fail open, let the page load
        if (!cancelled) setChecked(true);
      });

    return () => { cancelled = true; };
  }, [location.pathname]); // re-check on path change

  if (!checked) {
    // Minimal spinner while we verify — matches the patient dashboard style
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-500">Checking subscription…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default SubscriptionGuard;
