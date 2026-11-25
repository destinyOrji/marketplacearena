/**
 * VideoCallScreen — powered by Daily.co prebuilt iframe
 *
 * Uses Daily's battle-tested prebuilt UI embedded in a full-screen iframe.
 * This is the most reliable approach — no WebRTC track management needed.
 *
 * The prebuilt UI handles:
 *   - Camera/mic permissions
 *   - Video rendering for all participants
 *   - Audio routing
 *   - Network quality adaptation
 *
 * We wrap it with our own top/bottom chrome (name, end button).
 *
 * Modes:
 *   video_call  — full camera + audio
 *   phone_call  — audio only (startVideoOff=true)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

export interface VideoCallScreenProps {
  appointmentId:     string;
  roomUrl:           string;
  token:             string;
  callMode:          'video_call' | 'phone_call';
  displayName:       string;
  remoteDisplayName: string;
  remoteInitial:     string;
  serviceTitle?:     string;
  onEnd:             () => void;
}

// ─── Elapsed timer ─────────────────────────────────────────────────────────────

const useElapsed = (running: boolean) => {
  const [s, setS] = useState(0);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setS(x => x + 1), 1000);
    return () => clearInterval(t);
  }, [running]);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

// ─── Main component ────────────────────────────────────────────────────────────

const VideoCallScreen: React.FC<VideoCallScreenProps> = ({
  roomUrl,
  token,
  callMode,
  displayName,
  remoteDisplayName,
  remoteInitial,
  serviceTitle,
  onEnd,
}) => {
  const isPhone = callMode === 'phone_call';

  const [phase,  setPhase]  = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [ended,  setEnded]  = useState(false);
  const iframeRef           = useRef<HTMLIFrameElement>(null);
  const elapsed             = useElapsed(phase === 'connected');

  // Build the Daily prebuilt URL with config params
  const dailyUrl = (() => {
    const url = new URL(roomUrl);
    // Pass the meeting token so the user joins directly (no lobby page)
    url.searchParams.set('t', token);
    // User display name
    url.searchParams.set('displayName', displayName);
    // Audio-only mode for phone calls
    if (isPhone) {
      url.searchParams.set('startVideoOff', 'true');
    }
    // Hide Daily's own UI chrome — we show our own
    url.searchParams.set('embed', '1');
    return url.toString();
  })();

  // Listen for messages from Daily iframe (call events)
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!e.data || typeof e.data !== 'object') return;
      const { action } = e.data;
      if (action === 'joined-meeting')    setPhase('connected');
      if (action === 'participant-joined') setPhase('connected');
      if (action === 'left-meeting')      handleEnd();
      if (action === 'error')             console.error('Daily error:', e.data);
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Mark connected after 3s fallback (iframe postMessage not always reliable)
  useEffect(() => {
    const t = setTimeout(() => {
      if (phase === 'connecting') setPhase('connected');
    }, 3000);
    return () => clearTimeout(t);
  }, [phase]);

  const handleEnd = useCallback(() => {
    if (ended) return;
    setEnded(true);
    setPhase('ended');
    // Post hangup command to Daily iframe
    iframeRef.current?.contentWindow?.postMessage({ action: 'leave' }, '*');
    setTimeout(onEnd, 1500);
  }, [ended, onEnd]);

  return (
    <div className="fixed inset-0 bg-gray-950 flex flex-col overflow-hidden">

      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <div className="relative z-20 flex items-center justify-between px-4 py-3 bg-gray-950/90 backdrop-blur-sm border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0 ${
            isPhone
              ? 'bg-gradient-to-br from-green-500 to-emerald-600'
              : 'bg-gradient-to-br from-blue-500 to-indigo-600'
          }`}>
            {remoteInitial}
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">{remoteDisplayName}</p>
            {serviceTitle && <p className="text-white/50 text-xs">{serviceTitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Call mode badge */}
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            isPhone ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
          }`}>
            {isPhone ? '📞 Phone Call' : '📹 Video Call'}
          </span>

          {/* Timer */}
          {phase === 'connected' && (
            <span className="text-white/60 text-xs font-mono bg-white/10 px-2 py-1 rounded-full">
              {elapsed}
            </span>
          )}
          {phase === 'connecting' && (
            <span className="text-white/50 text-xs animate-pulse">Connecting…</span>
          )}

          {/* Encrypted badge */}
          <div className="hidden sm:flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full">
            <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd" />
            </svg>
            <span className="text-white/60 text-xs">Encrypted</span>
          </div>
        </div>
      </div>

      {/* ── Daily prebuilt iframe (takes all remaining space) ────────────── */}
      <div className="flex-1 relative">
        {phase === 'connecting' && (
          /* Loading overlay while iframe initialises */
          <div className="absolute inset-0 z-10 bg-gray-950 flex flex-col items-center justify-center gap-5">
            <div className="relative">
              <div className="absolute w-32 h-32 rounded-full bg-white/5 animate-ping"
                   style={{ animationDuration: '2s' }} />
              <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-white/20 z-10 relative ${
                isPhone
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                  : 'bg-gradient-to-br from-blue-500 to-indigo-600'
              }`}>
                <span className="text-white font-bold text-4xl">{remoteInitial}</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-white text-xl font-bold">{remoteDisplayName}</p>
              {serviceTitle && <p className="text-white/50 text-sm mt-1">{serviceTitle}</p>}
              <p className="text-white/40 text-sm mt-3 animate-pulse">
                {isPhone ? 'Starting audio call…' : 'Starting video call…'}
              </p>
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mt-2" />
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={dailyUrl}
          allow="camera; microphone; autoplay; display-capture; fullscreen; screen-wake-lock"
          allowFullScreen
          className="w-full h-full border-0"
          title="Video Call"
        />
      </div>

      {/* ── End call button ───────────────────────────────────────────────── */}
      {!ended && (
        <div className="relative z-20 flex justify-center py-4 bg-gray-950/90 backdrop-blur-sm border-t border-white/10 flex-shrink-0">
          <button
            onClick={handleEnd}
            className="flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 active:scale-95
                       text-white font-semibold rounded-full shadow-lg shadow-red-600/30 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
            </svg>
            End Call
          </button>
        </div>
      )}

      {/* ── Call ended overlay ────────────────────────────────────────────── */}
      {phase === 'ended' && (
        <div className="absolute inset-0 z-30 bg-gray-950/95 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 ring-2 ring-red-500/40">
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
              </svg>
            </div>
            <p className="text-white text-xl font-bold">Call Ended</p>
            <p className="text-white/50 text-sm mt-1">Duration: {elapsed}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCallScreen;
