/**
 * VideoCallScreen — WhatsApp Business-style video call UI
 *
 * Layout:
 *  - Full-screen dark background
 *  - Remote participant: large avatar / name centered (Jitsi handles actual video)
 *  - Local camera: small PiP in bottom-right corner (real getUserMedia preview)
 *  - Floating controls bar at bottom: mute · camera · end · speaker
 *  - Caller info strip at top: name + call duration
 *
 * Jitsi runs in a hidden iframe for signaling/WebRTC.
 * We show our own UI on top for the WhatsApp feel.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

const JITSI_DOMAIN = 'meet.jit.si';
export const getRoomName = (appointmentId: string) => `hma-apt-${appointmentId}`;

declare global {
  interface Window { JitsiMeetExternalAPI: any; }
}

export interface VideoCallScreenProps {
  appointmentId: string;
  displayName: string;        // local user's display name
  remoteDisplayName: string;  // other party's name shown on screen
  remoteInitial: string;      // single letter for avatar
  serviceTitle?: string;
  onEnd: () => void;          // called after call ends + cleanup
}

// ─── Elapsed timer ────────────────────────────────────────────────────────────
const useElapsed = (running: boolean) => {
  const [s, setS] = useState(0);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setS(x => x + 1), 1000);
    return () => clearInterval(t);
  }, [running]);
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
};

// ─── Control button ───────────────────────────────────────────────────────────
const CtrlBtn: React.FC<{
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
  label: string;
  children: React.ReactNode;
}> = ({ onClick, active = true, danger = false, label, children }) => (
  <button
    onClick={onClick}
    aria-label={label}
    className={`flex flex-col items-center gap-1.5 group`}
  >
    <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 ${
      danger
        ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/40'
        : active
        ? 'bg-white/20 hover:bg-white/30 backdrop-blur-sm'
        : 'bg-white/10 hover:bg-white/20 backdrop-blur-sm'
    }`}>
      {children}
    </div>
    <span className="text-white/70 text-xs font-medium">{label}</span>
  </button>
);

// ─── Main component ───────────────────────────────────────────────────────────
const VideoCallScreen: React.FC<VideoCallScreenProps> = ({
  appointmentId,
  displayName,
  remoteDisplayName,
  remoteInitial,
  serviceTitle,
  onEnd,
}) => {
  const [phase, setPhase] = useState<'connecting' | 'ringing' | 'connected' | 'ended'>('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [isSpeakerOff, setIsSpeakerOff] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);

  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const elapsed = useElapsed(phase === 'connected');

  // ── Load Jitsi script ──────────────────────────────────────────────────────
  useEffect(() => {
    if (document.querySelector(`script[src*="${JITSI_DOMAIN}/external_api.js"]`)) {
      initJitsi();
      return;
    }
    const script = document.createElement('script');
    script.src = `https://${JITSI_DOMAIN}/external_api.js`;
    script.async = true;
    script.onload = initJitsi;
    document.head.appendChild(script);
  }, []);

  // ── Start local camera preview ─────────────────────────────────────────────
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch(() => {
        // Camera not available — still allow call
      });
    return () => {
      localStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // ── Init Jitsi ─────────────────────────────────────────────────────────────
  const initJitsi = useCallback(() => {
    if (!window.JitsiMeetExternalAPI || !jitsiContainerRef.current) {
      setTimeout(initJitsi, 300);
      return;
    }

    const roomName = getRoomName(appointmentId);

    jitsiApiRef.current = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
      roomName,
      parentNode: jitsiContainerRef.current,
      width: '100%',
      height: '100%',
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        disableDeepLinking: true,
        prejoinPageEnabled: false,
        enableWelcomePage: false,
        disableInviteFunctions: true,
        // Hide all Jitsi UI — we draw our own
        toolbarButtons: [],
        disableRemoteMute: false,
        hideConferenceSubject: true,
        hideConferenceTimer: true,
        hideParticipantsStats: true,
        disableProfile: true,
        disablePolls: true,
        disableReactions: true,
        disableShortcuts: true,
        disableTileView: true,
        filmstrip: { disabled: true },
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_BRAND_WATERMARK: false,
        SHOW_POWERED_BY: false,
        DISPLAY_WELCOME_FOOTER: false,
        MOBILE_APP_PROMO: false,
        TOOLBAR_ALWAYS_VISIBLE: false,
        TOOLBAR_BUTTONS: [],
        SETTINGS_SECTIONS: [],
        VIDEO_QUALITY_LABEL_DISABLED: true,
        DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
        DEFAULT_BACKGROUND: '#111827',
        APP_NAME: 'Health Market Arena',
      },
      userInfo: { displayName, email: '' },
    });

    jitsiApiRef.current.addEventListeners({
      videoConferenceJoined: () => {
        setPhase('ringing');
      },
      participantJoined: () => {
        setParticipantCount(c => c + 1);
        setPhase('connected');
      },
      participantLeft: () => {
        setParticipantCount(c => Math.max(0, c - 1));
      },
      videoConferenceLeft: () => endCall(),
      readyToClose: () => endCall(),
    });
  }, [appointmentId, displayName]);

  // ── Controls ───────────────────────────────────────────────────────────────
  const toggleMute = () => {
    jitsiApiRef.current?.executeCommand('toggleAudio');
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = isMuted; });
    }
    setIsMuted(m => !m);
  };

  const toggleCamera = () => {
    jitsiApiRef.current?.executeCommand('toggleVideo');
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(t => { t.enabled = isCamOff; });
    }
    setIsCamOff(v => !v);
  };

  const toggleSpeaker = () => {
    setIsSpeakerOff(s => !s);
    // Mute/unmute Jitsi's audio output via the hidden iframe
    const iframe = jitsiContainerRef.current?.querySelector('iframe') as HTMLIFrameElement | null;
    if (iframe?.contentWindow) {
      // Best-effort: Jitsi doesn't expose speaker toggle via External API
      // so we mute the iframe element itself
      (iframe as any).muted = !isSpeakerOff;
    }
  };

  const endCall = useCallback(() => {
    if (phase === 'ended') return;
    setPhase('ended');
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    if (jitsiApiRef.current) {
      try { jitsiApiRef.current.executeCommand('hangup'); } catch {}
      try { jitsiApiRef.current.dispose(); } catch {}
      jitsiApiRef.current = null;
    }
    setTimeout(onEnd, 1800);
  }, [phase, onEnd]);

  // ── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      if (jitsiApiRef.current) {
        try { jitsiApiRef.current.dispose(); } catch {}
      }
    };
  }, []);

  const isConnected = phase === 'connected';
  const isRinging = phase === 'ringing' || phase === 'connecting';

  return (
    <div className="fixed inset-0 bg-gray-950 flex flex-col overflow-hidden select-none">

      {/* ── Hidden Jitsi iframe ── */}
      <div
        ref={jitsiContainerRef}
        className="absolute inset-0 opacity-0 pointer-events-none"
        aria-hidden="true"
      />

      {/* ── Remote video area (full screen) ── */}
      <div className="absolute inset-0 flex items-center justify-center">
        {isConnected ? (
          /* When connected: show a subtle background — Jitsi's actual remote
             video is in the hidden iframe. For a true custom UI you'd need
             WebRTC track extraction which requires a self-hosted Jitsi server.
             This gives the WhatsApp feel with the correct call state. */
          <div className="w-full h-full bg-gradient-to-b from-gray-900 to-gray-950" />
        ) : (
          /* Ringing / connecting state */
          <div className="flex flex-col items-center gap-6">
            {/* Pulsing avatar rings */}
            <div className="relative flex items-center justify-center">
              {isRinging && (
                <>
                  <div className="absolute w-44 h-44 rounded-full bg-white/5 animate-ping" style={{ animationDuration: '2s' }} />
                  <div className="absolute w-36 h-36 rounded-full bg-white/8 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.4s' }} />
                </>
              )}
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl z-10 ring-4 ring-white/20">
                <span className="text-white font-bold text-5xl">{remoteInitial}</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-white text-2xl font-bold">{remoteDisplayName}</p>
              {serviceTitle && <p className="text-white/60 text-sm mt-1">{serviceTitle}</p>}
              <p className="text-white/50 text-sm mt-3 animate-pulse">
                {phase === 'connecting' ? 'Connecting...' : 'Calling...'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Connected: remote name overlay ── */}
      {isConnected && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4 pointer-events-none">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl ring-4 ring-white/20">
            <span className="text-white font-bold text-4xl">{remoteInitial}</span>
          </div>
          <p className="text-white/80 text-lg font-semibold">{remoteDisplayName}</p>
        </div>
      )}

      {/* ── Top bar: name + timer ── */}
      <div className="relative z-20 flex items-center justify-between px-5 pt-safe pt-4 pb-3">
        <div>
          <p className="text-white font-bold text-base leading-tight">{remoteDisplayName}</p>
          <p className="text-white/60 text-xs mt-0.5">
            {phase === 'ended' ? 'Call ended' :
             phase === 'connected' ? elapsed :
             phase === 'ringing' ? 'Ringing...' : 'Connecting...'}
          </p>
        </div>
        {/* Encryption badge */}
        <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span className="text-white/70 text-xs font-medium">Encrypted</span>
        </div>
      </div>

      {/* ── Local camera PiP (bottom-right) ── */}
      <div className="absolute bottom-36 right-4 z-30 w-28 h-40 sm:w-32 sm:h-44 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/20">
        {isCamOff ? (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3l18 18" />
            </svg>
          </div>
        ) : (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />
        )}
        {/* "You" label */}
        <div className="absolute bottom-1.5 left-0 right-0 flex justify-center">
          <span className="text-white/80 text-xs bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">You</span>
        </div>
      </div>

      {/* ── Call ended overlay ── */}
      {phase === 'ended' && (
        <div className="absolute inset-0 z-40 bg-gray-950/90 flex items-center justify-center">
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

      {/* ── Bottom controls ── */}
      {phase !== 'ended' && (
        <div className="absolute bottom-0 left-0 right-0 z-30 pb-safe pb-8 pt-4 px-6">
          {/* Frosted glass pill */}
          <div className="bg-black/40 backdrop-blur-xl rounded-3xl px-6 py-4 flex items-center justify-between max-w-sm mx-auto shadow-2xl ring-1 ring-white/10">

            {/* Mute */}
            <CtrlBtn onClick={toggleMute} active={!isMuted} label={isMuted ? 'Unmute' : 'Mute'}>
              {isMuted ? (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </CtrlBtn>

            {/* Camera */}
            <CtrlBtn onClick={toggleCamera} active={!isCamOff} label={isCamOff ? 'Camera on' : 'Camera off'}>
              {isCamOff ? (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </CtrlBtn>

            {/* End call — center, larger */}
            <CtrlBtn onClick={endCall} danger label="End">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
              </svg>
            </CtrlBtn>

            {/* Speaker */}
            <CtrlBtn onClick={toggleSpeaker} active={!isSpeakerOff} label={isSpeakerOff ? 'Speaker on' : 'Speaker'}>
              {isSpeakerOff ? (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15.536 8.464a5 5 0 010 7.072M12 6v12m0 0l-3-3m3 3l3-3M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </CtrlBtn>

            {/* Flip camera (mobile) */}
            <CtrlBtn onClick={() => jitsiApiRef.current?.executeCommand('toggleCamera')} label="Flip">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </CtrlBtn>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCallScreen;
