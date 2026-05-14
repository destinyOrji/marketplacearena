// Video Call Page — Gym & Physio Dashboard
// Uses Jitsi Meet iframe — same room name formula as professional and patient sides
// Room: hma-apt-{appointmentId} — patient joins from their MyAppointments page

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAppointments } from '../services/api';
import { toast } from 'react-toastify';

const JITSI_DOMAIN = 'meet.jit.si';
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

  // Fetch appointment details
  useEffect(() => {
    if (!appointmentId) return;
    const load = async () => {
      try {
        const data = await getAppointments();
        const apt = (Array.isArray(data) ? data : []).find(
          (a: any) => (a._id || a.id)?.toString() === appointmentId
        );
        if (apt) {
          setAppointment({
            ...apt,
            id: apt._id || apt.id,
            patientName: apt.patient?.name
              || (apt.client?.user
                ? `${apt.client.user.firstName} ${apt.client.user.lastName}`.trim()
                : 'Client'),
            serviceTitle: apt.service?.title || (apt as any).serviceName || 'Session',
          });
        } else {
          toast.error('Appointment not found');
          setTimeout(() => navigate('/gym-physio/record-appointment'), 1500);
        }
      } catch {
        toast.error('Failed to load appointment');
        setTimeout(() => navigate('/gym-physio/record-appointment'), 1500);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [appointmentId, navigate]);

  // Load Jitsi script once
  useEffect(() => {
    if (document.querySelector(`script[src*="${JITSI_DOMAIN}/external_api.js"]`)) return;
    const script = document.createElement('script');
    script.src = `https://${JITSI_DOMAIN}/external_api.js`;
    script.async = true;
    document.head.appendChild(script);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (jitsiApiRef.current) {
        try { jitsiApiRef.current.dispose(); } catch {}
      }
    };
  }, []);

  const startCall = () => {
    if (!appointmentId || !jitsiContainerRef.current) return;

    const init = () => {
      if (!window.JitsiMeetExternalAPI) { setTimeout(init, 300); return; }

      const roomName = getRoomName(appointmentId);
      const patientName = appointment?.patientName || 'Client';

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
        },
        userInfo: {
          displayName: 'Provider (Gym/Physio)',
          email: '',
        },
      });

      jitsiApiRef.current.addEventListeners({
        readyToClose: () => handleEndCall(),
        videoConferenceLeft: () => handleEndCall(),
        videoConferenceJoined: () => {
          setJoined(true);
          toast.success(`Joined call with ${patientName}`);
        },
      });
    };

    init();
    setJoined(true);
  };

  const handleEndCall = () => {
    if (jitsiApiRef.current) {
      try { jitsiApiRef.current.dispose(); } catch {}
      jitsiApiRef.current = null;
    }
    setCallEnded(true);
    setJoined(false);
    toast.success('Call ended');
    setTimeout(() => navigate('/gym-physio/record-appointment'), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Appointment Not Found</h2>
          <button onClick={() => navigate('/gym-physio/record-appointment')}
            className="px-6 py-3 bg-blue-600 rounded-xl hover:bg-blue-700 font-semibold">
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  const patientName = appointment.patientName || 'Client';
  const serviceTitle = appointment.serviceTitle || 'Session';
  const roomName = appointmentId ? getRoomName(appointmentId) : '';

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 sm:px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          {!joined && (
            <button onClick={() => navigate('/gym-physio/record-appointment')}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
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
          <span className="text-xs text-gray-500 hidden sm:block font-mono">{roomName}</span>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col relative">
        {/* Jitsi iframe container */}
        <div
          ref={jitsiContainerRef}
          className={`flex-1 ${joined ? 'block' : 'hidden'}`}
          style={{ minHeight: 0 }}
        />

        {/* Pre-call lobby */}
        {!joined && !callEnded && (
          <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
            <div className="text-center max-w-md w-full">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mx-auto mb-6 shadow-2xl ring-4 ring-orange-500 ring-opacity-30">
                <span className="text-white font-bold text-5xl">
                  {patientName.charAt(0).toUpperCase()}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-white mb-1">Ready to join?</h2>
              <p className="text-gray-400 text-sm mb-1">
                Client: <span className="text-white font-medium">{patientName}</span>
              </p>
              <p className="text-gray-400 text-sm mb-6">
                Session: <span className="text-white font-medium">{serviceTitle}</span>
              </p>

              <div className="bg-gray-800 rounded-2xl p-4 mb-6 text-left space-y-2.5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Call Details</p>
                {[
                  { icon: '🔒', text: 'Private room — end-to-end encrypted via Jitsi Meet' },
                  { icon: '📱', text: 'Client joins from their appointments page' },
                  { icon: '🖥️', text: 'Screen share, chat & recording available in-call' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="text-base flex-shrink-0">{item.icon}</span>
                    <p className="text-sm text-gray-300">{item.text}</p>
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

              <p className="text-xs text-gray-500 mt-3">
                Room: <span className="font-mono text-gray-400">{roomName}</span>
              </p>
            </div>
          </div>
        )}

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
    </div>
  );
};

export default VideoCall;
