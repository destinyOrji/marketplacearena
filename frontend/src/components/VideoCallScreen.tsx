/**
 * VideoCallScreen — WhatsApp-style UI powered by Daily.co
 *
 * Modes:
 *   video_call  — full camera + audio (shows real remote video feed)
 *   phone_call  — audio only (no camera, shows avatar + waveform)
 *
 * How it works:
 *   1. Parent fetches a Daily room URL + token from /api/calls/room/:appointmentId
 *   2. Passes them as props here
 *   3. We join the Daily room with daily-js, subscribe to tracks, and render
 *      the remote participant's video/audio directly — no hidden iframes
 */

import React, {
  useState, useEffect, useRef, useCallback,
} from 'react';
import DailyIframe, {
  DailyCall,
  DailyParticipant,
  DailyEventObjectParticipant,
  DailyEventObjectParticipantLeft,
  DailyEventObjectFatalError,
} from '@daily-co/daily-js';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface VideoCallScreenProps {
  appointmentId:    string;
  roomUrl:          string;   // from /api/calls/room/:id  → data.roomUrl
  token:            string;   // from /api/calls/room/:id  → data.token
  callMode:         'video_call' | 'phone_call';
  displayName:      string;
  remoteDisplayName: string;
  remoteInitial:    string;
  serviceTitle?:    string;
  onEnd:            () => void;
}

// ─── Elapsed timer ────────────────────────────────────────────────────────────

const useElapsed = (running: boolean) => {
  const [s, setS] = useState(0);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setS(x => x + 1), 1000);
    return () => clearInterval(t);
  }, [running]);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

// ─── Control button ───────────────────────────────────────────────────────────

const CtrlBtn: React.FC<{
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
  label: string;
  children: React.ReactNode;
}> = ({ onClick, active = true, danger = false, label, children }) => (
  <button onClick={onClick} aria-label={label}
    className="flex flex-col items-center gap-1.5">
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

// ─── Audio waveform (phone call indicator) ────────────────────────────────────

const Waveform: React.FC<{ active: boolean }> = ({ active }) => (
  <div className="flex items-end gap-1 h-8">
    {[0.4, 0.7, 1, 0.7, 0.5, 0.9, 0.6, 1, 0.8, 0.5].map((h, i) => (
      <div key={i}
        style={{ height: `${h * 100}%`, animationDelay: `${i * 0.1}s` }}
        className={`w-1 rounded-full ${active ? 'bg-blue-400 animate-pulse' : 'bg-white/20'}`}
      />
    ))}
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

const VideoCallScreen: React.FC<VideoCallScreenProps> = ({
  appointmentId,
  roomUrl,
  token,
  callMode,
  displayName,
  remoteDisplayName,
  remoteInitial,
  serviceTitle,
  onEnd,
}) => {
  const isVideoCall = callMode === 'video_call';

  const [phase, setPhase]         = useState<'connecting' | 'ringing' | 'connected' | 'ended'>('connecting');
  const [isMuted,   setIsMuted]   = useState(false);
  const [isCamOff,  setIsCamOff]  = useState(!isVideoCall); // phone call starts with cam off
  const [hasRemote, setHasRemote] = useState(false);
  const [callError, setCallError] = useState<string | null>(null);

  const callRef        = useRef<DailyCall | null>(null);
  const localVideoRef  = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  const elapsed = useElapsed(phase === 'connected');

  // ── Join Daily room ──────────────────────────────────────────────────────
  useEffect(() => {
    let call: DailyCall;

    const join = async () => {
      try {
        call = DailyIframe.createCallObject({
          audioSource: true,
          videoSource: isVideoCall,
          dailyConfig: { experimentalChromeVideoMuteLightOff: true },
        });
        callRef.current = call;

        // ── Event listeners ──────────────────────────────────────────────
        call.on('joined-meeting', () => {
          setPhase('ringing');
          // Attach local video track
          if (isVideoCall && localVideoRef.current) {
            const localParticipant = call.participants().local;
            const track = localParticipant?.tracks?.video?.persistentTrack;
            if (track) {
              localVideoRef.current.srcObject = new MediaStream([track]);
            }
          }
        });

        call.on('participant-joined', (evt: DailyEventObjectParticipant) => {
          if (evt.participant.local) return;
          setPhase('connected');
          setHasRemote(true);
          attachRemoteTracks(evt.participant);
        });

        call.on('participant-updated', (evt: DailyEventObjectParticipant) => {
          if (evt.participant.local) {
            // Update local video if track changed
            if (isVideoCall && localVideoRef.current) {
              const track = evt.participant.tracks?.video?.persistentTrack;
              if (track) localVideoRef.current.srcObject = new MediaStream([track]);
            }
            return;
          }
          attachRemoteTracks(evt.participant);
        });

        call.on('participant-left', (_evt: DailyEventObjectParticipantLeft) => {
          setHasRemote(false);
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
          if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
        });

        call.on('left-meeting', () => endCall());

        call.on('error', (evt: DailyEventObjectFatalError) => {
          console.error('Daily error:', evt);
          setCallError(evt.errorMsg || 'Call connection error');
        });

        await call.join({ url: roomUrl, token, userName: displayName });
      } catch (err: any) {
        console.error('Daily join error:', err);
        setCallError(err.message || 'Failed to join call');
      }
    };

    join();

    return () => {
      if (callRef.current) {
        try { callRef.current.leave(); } catch {}
        try { callRef.current.destroy(); } catch {}
        callRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomUrl, token]);

  // ── Attach remote tracks to video/audio elements ─────────────────────────
  const attachRemoteTracks = useCallback((participant: DailyParticipant) => {
    // Audio — always attach regardless of mode
    const audioTrack = participant.tracks?.audio?.persistentTrack;
    if (audioTrack && remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = new MediaStream([audioTrack]);
    }

    // Video — only in video call mode
    if (isVideoCall) {
      const videoTrack = participant.tracks?.video?.persistentTrack;
      if (videoTrack && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = new MediaStream([videoTrack]);
      }
    }
  }, [isVideoCall]);

  // ── Controls ─────────────────────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    if (!callRef.current) return;
    callRef.current.setLocalAudio(isMuted); // isMuted=true means currently muted → enable
    setIsMuted(m => !m);
  }, [isMuted]);

  const toggleCamera = useCallback(() => {
    if (!callRef.current || !isVideoCall) return;
    callRef.current.setLocalVideo(isCamOff); // isCamOff=true means currently off → enable
    setIsCamOff(v => !v);
  }, [isCamOff, isVideoCall]);

  const endCall = useCallback(() => {
    if (phase === 'ended') return;
    setPhase('ended');
    if (callRef.current) {
      try { callRef.current.leave(); } catch {}
      try { callRef.current.destroy(); } catch {}
      callRef.current = null;
    }
    // Clean up media elements
    if (localVideoRef.current)  localVideoRef.current.srcObject  = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    setTimeout(onEnd, 1800);
  }, [phase, onEnd]);

  const isConnecting = phase === 'connecting' || phase === 'ringing';

  // ── Error state ──────────────────────────────────────────────────────────
  if (callError) {
    return (
      <div className="fixed inset-0 bg-gray-950 flex items-center justify-center">
        <div className="text-center px-8">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
            </svg>
          </div>
          <p className="text-white text-lg font-semibold mb-2">Call Error</p>
          <p className="text-white/60 text-sm mb-6">{callError}</p>
          <button onClick={onEnd}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-950 flex flex-col overflow-hidden select-none">

      {/* ── Hidden audio element for remote participant ── */}
      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />

      {/* ── Remote video (video call only) ── */}
      {isVideoCall && (
        <div className="absolute inset-0">
          {hasRemote ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            /* Waiting for remote — dark gradient with avatar */
            <div className="w-full h-full bg-gradient-to-b from-gray-900 to-gray-950 flex items-center justify-center">
              <div className="flex flex-col items-center gap-5">
                <div className="relative">
                  {isConnecting && (
                    <>
                      <div className="absolute w-44 h-44 rounded-full bg-white/5 animate-ping"
                           style={{ animationDuration: '2s' }} />
                      <div className="absolute w-36 h-36 rounded-full bg-white/8 animate-ping"
                           style={{ animationDuration: '2s', animationDelay: '0.4s' }} />
                    </>
                  )}
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600
                                  flex items-center justify-center shadow-2xl z-10 relative
                                  ring-4 ring-white/20">
                    <span className="text-white font-bold text-5xl">{remoteInitial}</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-white text-2xl font-bold">{remoteDisplayName}</p>
                  {serviceTitle && <p className="text-white/60 text-sm mt-1">{serviceTitle}</p>}
                  <p className="text-white/50 text-sm mt-3 animate-pulse">
                    {phase === 'connecting' ? 'Connecting...' : 'Ringing...'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Phone call UI (audio only) ── */}
      {!isVideoCall && (
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-950
                        flex items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              {isConnecting && (
                <>
                  <div className="absolute w-44 h-44 rounded-full bg-white/5 animate-ping"
                       style={{ animationDuration: '2s' }} />
                  <div className="absolute w-36 h-36 rounded-full bg-white/8 animate-ping"
                       style={{ animationDuration: '2s', animationDelay: '0.4s' }} />
                </>
              )}
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-green-500 to-emerald-600
                              flex items-center justify-center shadow-2xl z-10 relative
                              ring-4 ring-white/20">
                <span className="text-white font-bold text-5xl">{remoteInitial}</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-white text-2xl font-bold">{remoteDisplayName}</p>
              {serviceTitle && <p className="text-white/60 text-sm mt-1">{serviceTitle}</p>}
              <p className="text-white/50 text-sm mt-1">
                {phase === 'connecting' ? 'Connecting...' :
                 phase === 'ringing'    ? 'Calling...' :
                 phase === 'connected'  ? `📞 ${elapsed}` : 'Call ended'}
              </p>
            </div>
            {/* Audio waveform when connected */}
            {phase === 'connected' && (
              <div className="mt-2">
                <Waveform active={!isMuted} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Connected video: remote name + timer overlay ── */}
      {isVideoCall && phase === 'connected' && hasRemote && (
        <div className="absolute bottom-32 left-4 z-20 pointer-events-none">
          <div className="bg-black/40 backdrop-blur-sm rounded-xl px-3 py-1.5">
            <p className="text-white text-sm font-semibold">{remoteDisplayName}</p>
          </div>
        </div>
      )}

      {/* ── Top bar ── */}
      <div className="relative z-20 flex items-center justify-between px-5 pt-4 pb-3">
        <div>
          <p className="text-white font-bold text-base leading-tight">
            {phase === 'connected' ? remoteDisplayName : (isVideoCall ? '📹 Video Call' : '📞 Phone Call')}
          </p>
          <p className="text-white/60 text-xs mt-0.5">
            {phase === 'ended'     ? 'Call ended' :
             phase === 'connected' ? (isVideoCall ? elapsed : '') :
             phase === 'ringing'   ? 'Ringing...' : 'Connecting...'}
          </p>
        </div>
        {/* Encrypted badge */}
        <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd" />
          </svg>
          <span className="text-white/70 text-xs font-medium">Encrypted</span>
        </div>
      </div>

      {/* ── Local camera PiP (video call only) ── */}
      {isVideoCall && (
        <div className="absolute bottom-36 right-4 z-30 w-28 h-40 sm:w-32 sm:h-44
                        rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/20">
          {isCamOff ? (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3l18 18" />
              </svg>
            </div>
          ) : (
            <video ref={localVideoRef} autoPlay playsInline muted
              className="w-full h-full object-cover scale-x-[-1]" />
          )}
          <div className="absolute bottom-1.5 left-0 right-0 flex justify-center">
            <span className="text-white/80 text-xs bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
              You
            </span>
          </div>
        </div>
      )}

      {/* ── Call ended overlay ── */}
      {phase === 'ended' && (
        <div className="absolute inset-0 z-40 bg-gray-950/90 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center
                            mx-auto mb-4 ring-2 ring-red-500/40">
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
        <div className="absolute bottom-0 left-0 right-0 z-30 pb-8 pt-4 px-6">
          <div className="bg-black/40 backdrop-blur-xl rounded-3xl px-6 py-4
                          flex items-center justify-center gap-8 max-w-sm mx-auto
                          shadow-2xl ring-1 ring-white/10">

            {/* Mute */}
            <CtrlBtn onClick={toggleMute} active={!isMuted} label={isMuted ? 'Unmute' : 'Mute'}>
              {isMuted ? (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </CtrlBtn>

            {/* Camera (video only) */}
            {isVideoCall && (
              <CtrlBtn onClick={toggleCamera} active={!isCamOff}
                       label={isCamOff ? 'Camera on' : 'Camera off'}>
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
            )}

            {/* End call */}
            <CtrlBtn onClick={endCall} danger label="End">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
              </svg>
            </CtrlBtn>

          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCallScreen;
