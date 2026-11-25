// Patient Video / Phone Call — powered by Daily.co
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components';
import { appointmentsApi } from '../services/api';
import { showErrorToast } from '../utils/toast';
import apiClient from '../services/apiClient';
import VideoCallScreen from '../../../components/VideoCallScreen';

interface RoomData {
  roomUrl:  string;
  token:    string;
  callMode: 'video_call' | 'phone_call';
}

interface AppointmentInfo {
  id:            string;
  providerName:  string;
  serviceTitle:  string;
  callMode:      'video_call' | 'phone_call';
}

const VideoCall: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate          = useNavigate();

  const [apptInfo, setApptInfo] = useState<AppointmentInfo | null>(null);
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [joining,  setJoining]  = useState(false);
  const [started,  setStarted]  = useState(false);

  // ── Load appointment ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!appointmentId) return;
    appointmentsApi.getAppointmentById(appointmentId)
      .then((res: any) => {
        const apt = res.data?.data || res.data || res;
        if (!apt) throw new Error('Appointment not found');

        const rawMode = apt.type || apt.appointmentMode || apt.consultationType || '';
        const callMode: 'video_call' | 'phone_call' =
          (rawMode === 'phone_call' || rawMode === 'phone') ? 'phone_call' : 'video_call';

        setApptInfo({
          id:           apt._id || apt.id,
          providerName: apt.provider?.name || apt.professionalName || 'Healthcare Provider',
          serviceTitle: apt.service?.title || apt.reasonForVisit || 'Consultation',
          callMode,
        });
      })
      .catch(() => {
        showErrorToast('Failed to load appointment');
        setTimeout(() => navigate('/patient/appointments'), 2000);
      })
      .finally(() => setLoading(false));
  }, [appointmentId, navigate]);

  // ── Fetch Daily room (on Join click) ─────────────────────────────────────
  const handleJoin = useCallback(async () => {
    if (!appointmentId) return;
    setJoining(true);
    try {
      const res  = await apiClient.post(`/calls/room/${appointmentId}`);
      const data = res.data?.data;
      setRoomData({
        roomUrl:  data.roomUrl,
        token:    data.token,
        callMode: data.callMode || apptInfo?.callMode || 'video_call',
      });
      setStarted(true);
    } catch (err: any) {
      showErrorToast(err.response?.data?.message || 'Failed to start call. Try again.');
    } finally {
      setJoining(false);
    }
  }, [appointmentId, apptInfo]);

  // ── After call ends ───────────────────────────────────────────────────────
  const handleEnd = useCallback(async () => {
    if (appointmentId) {
      try { await apiClient.delete(`/calls/room/${appointmentId}`); } catch {}
    }
    navigate('/patient/appointments');
  }, [appointmentId, navigate]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-600 border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  // ── Active call (full-screen, outside DashboardLayout) ───────────────────
  if (started && roomData && apptInfo) {
    return (
      <VideoCallScreen
        appointmentId={appointmentId!}
        roomUrl={roomData.roomUrl}
        token={roomData.token}
        callMode={roomData.callMode}
        displayName="Patient"
        remoteDisplayName={apptInfo.providerName}
        remoteInitial={apptInfo.providerName.charAt(0).toUpperCase()}
        serviceTitle={apptInfo.serviceTitle}
        onEnd={handleEnd}
      />
    );
  }

  // ── Pre-call lobby ────────────────────────────────────────────────────────
  const name    = apptInfo?.providerName || 'Healthcare Provider';
  const title   = apptInfo?.serviceTitle || 'Consultation';
  const initial = name.charAt(0).toUpperCase();
  const isPhone = apptInfo?.callMode === 'phone_call';

  const lobbyHints = isPhone
    ? [
        { icon: '🎙️', text: 'Microphone access required — no camera needed' },
        { icon: '🔒', text: 'End-to-end encrypted audio call' },
        { icon: '📱', text: 'Works on mobile and desktop' },
      ]
    : [
        { icon: '🎥', text: 'Allow camera & microphone when prompted' },
        { icon: '🔒', text: 'End-to-end encrypted video call' },
        { icon: '📱', text: 'Works on mobile and desktop' },
      ];

  return (
    <DashboardLayout>
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="text-center max-w-sm w-full">

          {/* Avatar */}
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5 shadow-xl ring-4 ${
            isPhone
              ? 'bg-gradient-to-br from-green-500 to-emerald-600 ring-green-100'
              : 'bg-gradient-to-br from-blue-500 to-indigo-600 ring-blue-100'
          }`}>
            <span className="text-white font-bold text-4xl">{initial}</span>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-1">{name}</h2>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-6 ${
            isPhone ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {isPhone ? '📞 Phone Call' : '📹 Video Call'}
          </span>

          {/* Hints */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6 text-left space-y-2.5">
            {lobbyHints.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="text-base flex-shrink-0">{item.icon}</span>
                <p className="text-sm text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>

          {/* Join button */}
          <button
            onClick={handleJoin}
            disabled={joining}
            className={`w-full inline-flex items-center justify-center gap-2 py-4 font-bold text-base
                        rounded-2xl transition-all shadow-lg active:scale-95 disabled:opacity-60 text-white ${
              isPhone
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {joining ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                Starting call…
              </>
            ) : isPhone ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Join Phone Call
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Join Video Call
              </>
            )}
          </button>

          <button onClick={() => navigate('/patient/appointments')}
            className="mt-3 w-full py-3 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            ← Back to Appointments
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VideoCall;
