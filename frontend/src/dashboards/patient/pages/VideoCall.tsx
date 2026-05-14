// Video Call Page — Patient Dashboard
// Uses Jitsi Meet iframe — joins the same room as the professional
// Room name is derived from appointmentId — no backend coordination needed

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components';
import { appointmentsApi } from '../services/api';
import { showErrorToast, showSuccessToast } from '../utils/toast';

// Jitsi Meet domain — free, no API key required
const JITSI_DOMAIN = 'meet.jit.si';

// Must match the professional side exactly
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
    const load = async () => {
      try {
        setLoading(true);
        const response = await appointmentsApi.getAppointmentById(appointmentId);
        const data = (response as any).data?.data || (response as any).data;
        if (!data) throw new Error('Appointment not found');
        setAppointment(data);
      } catch (err: any) {
        showErrorToast(err?.message || 'Failed to load appointment details');
        setTimeout(() => navigate('/patient/appointments'), 2000);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [appointmentId, navigate]);

  // Load Jitsi External API script once
  useEffect(() => {
    if (scriptRef.current || document.querySelector(`script[src*="${JITSI_DOMAIN}/external_api.js"]`)) return;
    const script = document.createElement('script');
    script.src = `https://${JITSI_DOMAIN}/external_api.js`;
    script.async = true;
    document.head.appendChild(script);
    scriptRef.current = script;
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
      const providerName = appointment?.provider?.name
        || appointment?.professionalName
        || 'Healthcare Provider';

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
          displayName: 'Patient',
          email: '',
        },
      });

      jitsiApiRef.current.addEventListeners({
        readyToClose: () => handleEndCall(),
        videoConferenceLeft: () => handleEndCall(),
        videoConferenceJoined: () => {
          setJoined(true);
          showSuccessToast(`Connected with ${providerName}`);
        },
      });
    };

    loadJitsi();
    setJoined(true);
  };

  const handleEndCall = () => {
    if (jitsiApiRef.current) {
      try { jitsiApiRef.current.dispose(); } catch {}
      jitsiApiRef.current = null;
    }
    setCallEnded(true);
    setJoined(false);
    showSuccessToast('Call ended');
    setTimeout(() => navigate('/patient/appointments'), 2000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (jitsiApiRef.current) {
        try { jitsiApiRef.current.dispose(); } catch {}
      }
    };
  }, []);

  const providerName = appointment?.provider?.name
    || appointment?.professionalName
    || 'Healthcare Provider';
  const serviceTitle = appointment?.service?.title
    || appointment?.reasonForVisit
    || 'Consultation';
  const providerInitial = providerName.charAt(0).toUpperCase();
  const roomName = appointmentId ? getRoomName(appointmentId) : '';

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
            <p className="text-gray-600">Loading video call...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Full-screen layout when in call — no DashboardLayout wrapper
  if (joined || callEnded) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        {/* Minimal header */}
        <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-sm font-bold text-white">📹 {providerName}</h1>
            <p className="text-xs text-gray-400">{serviceTitle}</p>
          </div>
          {joined && (
            <span className="flex items-center gap-1.5 text-xs text-green-300 bg-green-900 bg-opacity-60 px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Live
            </span>
          )}
        </div>

        {/* Jitsi container */}
        <div
          ref={jitsiContainerRef}
          className={`flex-1 ${joined ? 'block' : 'hidden'}`}
          style={{ minHeight: 0 }}
        />

        {/* Call ended */}
        {callEnded && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Call Ended</h2>
              <p className="text-gray-400 text-sm">Redirecting to appointments...</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Pre-call lobby — inside DashboardLayout
  return (
    <DashboardLayout>
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          {/* Provider avatar */}
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-2xl ring-4 ring-blue-200">
            <span className="text-white font-bold text-5xl">{providerInitial}</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Ready to join?</h2>
          <p className="text-gray-500 text-sm mb-1">
            Provider: <span className="text-gray-900 font-semibold">{providerName}</span>
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Service: <span className="text-gray-900 font-semibold">{serviceTitle}</span>
          </p>

          {/* Info card */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6 text-left space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Before you join</p>
            {[
              { icon: '🎥', text: 'Allow camera and microphone access when prompted' },
              { icon: '🔒', text: 'Your call is private and end-to-end encrypted' },
              { icon: '📱', text: 'Works on desktop and mobile browsers' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="text-base flex-shrink-0">{item.icon}</span>
                <p className="text-sm text-gray-600">{item.text}</p>
              </div>
            ))}
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

          <button
            onClick={() => navigate('/patient/appointments')}
            className="mt-3 w-full px-8 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Back to Appointments
          </button>

          <p className="text-xs text-gray-400 mt-2">
            Room: <span className="font-mono">{roomName}</span>
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VideoCall;
