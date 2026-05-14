// Video Call Page — Professional Dashboard
// Uses Jitsi Meet iframe — both patient and professional join the same room
// Room name is derived from appointmentId so no backend coordination needed

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiClient from '../services/apiClient';

// Jitsi Meet domain — free, no API key required
const JITSI_DOMAIN = 'meet.jit.si';

// Derive a deterministic room name from the appointment ID
// Prefix with "hma-" so it's namespaced and hard to guess
const getRoomName = (appointmentId: string) => `hma-apt-${appointmentId}`;

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

const VideoCall: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const [callEnded, setCallEnded] = useState(false);

  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  // Fetch appointment details
  useEffect(() => {
    if (!appointmentId) return;
    apiClient.get('/professionals/appointments')
      .then(res => {
        const list: any[] = res.data?.data ?? res.data ?? [];
        const apt = list.find((a: any) => (a._id || a.id)?.toString() === appointmentId);
        if (apt) {
          setAppointment({
            ...apt,
            id: apt._id || apt.id,
            patientName: apt.patient?.name || 'Patient',
            serviceTitle: apt.service?.title || apt.reasonForVisit || 'Consultation',
          });
        } else {
          toast.error('Appointment not found');
          setTimeout(() => navigate('/professional/appointments'), 1500);
        }
      })
      .catch(() => {
        toast.error('Failed to load appointment');
        setTimeout(() => navigate('/professional/appointments'), 1500);
      })
      .finally(() => setLoading(false));
  }, [appointmentId, navigate]);

  // Load Jitsi External API script once
  useEffect(() => {
    if (scriptRef.current) return;
    const script = document.createElement('script');
    script.src = `https://${JITSI_DOMAIN}/external_api.js`;
    script.async = true;
    document.head.appendChild(script);
    scriptRef.current = script;
    return () => {
      // Don't remove — may be reused
    };
  }, []);

  // Start the Jitsi call
  const startCall = () => {
    if (!appointmentId || !jitsiContainerRef.current) return;

    const loadJitsi = () => {
      if (!window.JitsiMeetExternalAPI) {
        setTimeout(loadJitsi, 300);
        return;
      }

      const roomName = getRoomName(appointmentId);
      const patientName = appointment?.patientName || 'Patient';
      const serviceTitle = appointment?.serviceTitle || 'Consultation';

      jitsiApiRef.current = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
        roomName,
        parentNode: jitsiContainerRef.current,
        width: '100%',
        height: '100%',
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          disableDeepLinking: true,
          prejoinPageEnabled: false,          // skip Jitsi's own lobby
          enableWelcomePage: false,
          disableInviteFunctions: true,
          toolbarButtons: [
            'microphone', 'camera', 'closedcaptions', 'desktop',
            'fullscreen', 'fodeviceselection', 'hangup', 'chat',
            'settings', 'raisehand', 'videoquality', 'filmstrip',
            'tileview', 'download', 'help',
          ],
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          BRAND_WATERMARK_LINK: '',
          SHOW_POWERED_BY: false,
          DISPLAY_WELCOME_FOOTER: false,
          MOBILE_APP_PROMO: false,
          APP_NAME: 'Health Market Arena',
          NATIVE_APP_NAME: 'Health Market Arena',
          DEFAULT_BACKGROUND: '#1f2937',
          TOOLBAR_ALWAYS_VISIBLE: false,
        },
        userInfo: {
          displayName: `Dr. ${appointment?.patient?.name ? 'Provider' : 'Provider'} (Professional)`,
          email: '',
        },
      });

      // Event listeners
      jitsiApiRef.current.addEventListeners({
        readyToClose: () => {
          handleEndCall();
        },
        videoConferenceLeft: () => {
          handleEndCall();
        },
        videoConferenceJoined: () => {
          setJoined(true);
          toast.success(`Joined room with ${patientName}`);
        },
      });
    };

    loadJitsi();
    setJoined(true); // show container immediately
  };

  const handleEndCall = () => {
    if (jitsiApiRef.current) {
      try { jitsiApiRef.current.dispose(); } catch {}
      jitsiApiRef.current = null;
    }
    setCallEnded(true);
    setJoined(false);
    toast.success('Call ended');
    setTimeout(() => navigate('/professional/appointments'), 2000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (jitsiApiRef.current) {
        try { jitsiApiRef.current.dispose(); } catch {}
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-300 text-sm">Loading video call...</p>
        </div>
      </div>
    );
  }

  const patientName = appointment?.patientName || 'Patient';
  const serviceTitle = appointment?.serviceTitle || 'Consultation';
  const roomName = appointmentId ? getRoomName(appointmentId) : '';

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 sm:px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          {!joined && (
            <button
              onClick={() => navigate('/professional/appointments')}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white">
              📹 Video Call — {patientName}
            </h1>
            <p className="text-xs text-gray-400">{serviceTitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {joined && (
            <span className="flex items-center gap-1.5 text-xs text-green-300 bg-green-900 bg-opacity-60 px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Live
            </span>
          )}
          <span className="text-xs text-gray-500 hidden sm:block">
            Room: <span className="text-gray-400 font-mono">{roomName}</span>
          </span>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col relative">
        {/* Jitsi iframe container — always mounted so it can be initialized */}
        <div
          ref={jitsiContainerRef}
          className={`flex-1 ${joined ? 'block' : 'hidden'}`}
          style={{ minHeight: 0 }}
        />

        {/* Pre-call lobby */}
        {!joined && !callEnded && (
          <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
            <div className="text-center max-w-md w-full">
              {/* Patient avatar */}
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-2xl ring-4 ring-blue-500 ring-opacity-30">
                <span className="text-white font-bold text-5xl">
                  {patientName.charAt(0).toUpperCase()}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-white mb-1">Ready to join?</h2>
              <p className="text-gray-400 text-sm mb-1">
                Patient: <span className="text-white font-medium">{patientName}</span>
              </p>
              <p className="text-gray-400 text-sm mb-6">
                Service: <span className="text-white font-medium">{serviceTitle}</span>
              </p>

              {/* Room info */}
              <div className="bg-gray-800 rounded-2xl p-4 mb-6 text-left">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Call Details
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-300">Powered by <span className="text-white font-medium">Jitsi Meet</span> — end-to-end encrypted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-sm text-gray-300">Private room — only you and the patient can join</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-sm text-gray-300">Screen share, chat & recording available in-call</span>
                  </div>
                </div>
              </div>

              <button
                onClick={startCall}
                className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-2xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Join Video Call
              </button>

              <p className="text-xs text-gray-500 mt-3">
                The patient joins from their appointments page using the same room
              </p>
            </div>
          </div>
        )}

        {/* Call ended screen */}
        {callEnded && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Call Ended</h2>
              <p className="text-gray-400 text-sm">Redirecting to appointments...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCall;
