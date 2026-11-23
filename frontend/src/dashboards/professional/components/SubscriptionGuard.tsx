/**
 * Professional SubscriptionGuard
 *
 * Checks /subscriptions/provider/status on every protected route.
 * No active subscription → redirects to /professional/subscription.
 * Active subscription    → renders children.
 * Network/API error      → fail-open (lets the page load).
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';

// Always accessible — no subscription required
const EXEMPT_PATHS = [
  '/professional/subscription',
  '/professional/dashboard',
  '/professional/profile',
  '/professional/notifications',
  '/professional/settings',
];

interface Props {
  children: React.ReactNode;
}

const SubscriptionGuard: React.FC<Props> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isExempt = EXEMPT_PATHS.some(p => location.pathname.startsWith(p));
  const [checked, setChecked] = useState(isExempt);

  useEffect(() => {
    if (isExempt) { setChecked(true); return; }

    let cancelled = false;

    const token =
      localStorage.getItem('professionalToken') ||
      localStorage.getItem('authToken');

    if (!token) {
      navigate('/professional/subscription', { replace: true });
      return;
    }

    fetch(`${API_URL}/subscriptions/provider/status`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(json => {
        if (cancelled) return;
        const data = json?.data ?? {};
        const active =
          data.hasActiveSubscription === true ||
          data.isActive === true ||
          data.status === 'active';

        if (!active) {
          sessionStorage.setItem('professionalSubscriptionReturnTo', location.pathname + location.search);
          navigate('/professional/subscription', { replace: true });
        } else {
          setChecked(true);
        }
      })
      .catch(() => {
        // Network error — fail open
        if (!cancelled) setChecked(true);
      });

    return () => { cancelled = true; };
  }, [location.pathname]);

  if (!checked) {
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
