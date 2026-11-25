/**
 * IncomingCallBanner
 *
 * Polls /api/notifications every 8 seconds for unread `call_started`
 * notifications. When one is found it shows a full-width ringing banner
 * at the top of the screen.
 *
 * Accept  → navigates to the call page and marks the notification read
 * Dismiss → marks the notification read and hides the banner
 *
 * Mount this once at the top of each dashboard layout (patient, professional).
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';
const POLL_INTERVAL_MS = 8000;

interface CallNotification {
  id:      string;
  title:   string;
  message: string;
  data: {
    appointmentId: string;
    callMode:      'video_call' | 'phone_call';
    callerName:    string;
    joinPath:      string;
  };
}

// ── Pulsing ring animation ─────────────────────────────────────────────────────
const RingIcon: React.FC<{ isPhone: boolean }> = ({ isPhone }) => (
  <div className="relative flex-shrink-0">
    <div className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
    <div className={`relative w-12 h-12 rounded-full flex items-center justify-center ${
      isPhone ? 'bg-green-500' : 'bg-blue-500'
    }`}>
      {isPhone ? (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ) : (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </div>
  </div>
);

const IncomingCallBanner: React.FC = () => {
  const navigate                        = useNavigate();
  const [call, setCall]                 = useState<CallNotification | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const timerRef                        = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getToken = () =>
    localStorage.getItem('professionalToken') ||
    localStorage.getItem('patientToken')       ||
    localStorage.getItem('hospitalToken')      ||
    localStorage.getItem('gymPhysioToken')     ||
    localStorage.getItem('ambulanceToken')     ||
    localStorage.getItem('authToken')          ||
    '';

  const markRead = useCallback(async (id: string) => {
    try {
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method:  'PUT',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
    } catch { /* non-fatal */ }
  }, []);

  const poll = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      const res  = await fetch(`${API_URL}/notifications?limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const json = await res.json();
      const list: any[] = json.data || [];

      // Find the newest unread call_started notification we haven't dismissed
      const incoming = list.find(
        (n: any) =>
          n.type === 'call_started' &&
          !n.isRead &&
          !dismissedIds.has(n.id || n._id)
      );

      if (incoming) {
        setCall({
          id:      incoming.id || incoming._id,
          title:   incoming.title,
          message: incoming.message,
          data:    incoming.data || {},
        });
        // Auto-dismiss after 60 seconds if not acted on
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => handleDismiss(incoming.id || incoming._id), 60000);
      } else {
        setCall(null);
      }
    } catch { /* network error — silent */ }
  }, [dismissedIds]); // eslint-disable-line react-hooks/exhaustive-deps

  // Start polling
  useEffect(() => {
    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      clearInterval(interval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [poll]);

  const handleAccept = useCallback(() => {
    if (!call) return;
    markRead(call.id);
    setDismissedIds(s => new Set(s).add(call.id));
    setCall(null);
    if (timerRef.current) clearTimeout(timerRef.current);
    navigate(call.data.joinPath || '/');
  }, [call, markRead, navigate]);

  const handleDismiss = useCallback((id?: string) => {
    const targetId = id || call?.id;
    if (!targetId) return;
    markRead(targetId);
    setDismissedIds(s => new Set(s).add(targetId));
    setCall(null);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, [call, markRead]);

  if (!call) return null;

  const isPhone = call.data?.callMode === 'phone_call';

  return (
    <div className={`fixed top-0 left-0 right-0 z-[9999] flex items-center justify-between gap-3 px-4 py-3 shadow-2xl ${
      isPhone
        ? 'bg-gradient-to-r from-green-600 to-emerald-700'
        : 'bg-gradient-to-r from-blue-600 to-indigo-700'
    }`}>
      {/* Left: icon + text */}
      <div className="flex items-center gap-3 min-w-0">
        <RingIcon isPhone={isPhone} />
        <div className="min-w-0">
          <p className="text-white font-bold text-sm leading-tight truncate">
            {call.title}
          </p>
          <p className="text-white/80 text-xs mt-0.5 truncate">
            {call.message}
          </p>
        </div>
      </div>

      {/* Right: buttons */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Accept */}
        <button
          onClick={handleAccept}
          className="flex items-center gap-1.5 px-4 py-2 bg-white text-green-700 font-bold text-sm rounded-xl
                     hover:bg-green-50 active:scale-95 transition-all shadow-md"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Accept
        </button>

        {/* Dismiss */}
        <button
          onClick={() => handleDismiss()}
          className="flex items-center gap-1.5 px-3 py-2 bg-white/20 hover:bg-white/30 text-white
                     font-semibold text-sm rounded-xl active:scale-95 transition-all"
          aria-label="Dismiss call"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
          </svg>
          <span className="hidden sm:inline">Decline</span>
        </button>
      </div>
    </div>
  );
};

export default IncomingCallBanner;
