// Gym & Physio Video / Phone Call — powered by Daily.co
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { gymPhysioApiClient as apiClient } from '../services/api';
import VideoCallScreen from '../../../components/VideoCallScreen';

interface RoomData {
  roomUrl:  string;
  token:    string;
  callMode: 'video_call' | 'phone_call';
}

interface AppointmentInfo {
  id:           string;
  clientName:   string;
  serviceTitle: string;
  callMode:     'video_call' | 'phone_call';
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
    apiClient.get('/gym-physio/appointments')
      .then(res => {
        const list: any[] = res.data?.data ?? res.data ?? [];
        const apt = list.find((a: any) => (a._id || a.id)?.toString() === appointmentId);
        if (!apt) throw new Error('Appointment not found');

        const rawMode = apt.appointmentMode || apt.type || '';
        const callMode: 'video_call' | 'phone_call' =
          (rawMode === 'phone_call' || rawMode === 'phone') ? 'phone_call' : 'video_call';

        const client = apt.client || apt.patient || {};
        const clientName =
          client.user?.firstName
            ? `${client.user.firstName} ${client.user.lastName || ''}`.trim()
            : client.name || client.firstName || 'Client';

        setApptInfo({
          id:           apt._id || apt.id,
          clientName,
          serviceTitle: apt.service?.title || apt.reasonForVisit || 'Session',
          callMode,
        });
      })
      .catch(err => {
        toast.error(err.message || 'Failed to load appointment');
        setTimeout(() => navigate('/gym-physio/appointments'), 1500);
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
      toast.error(err.response?.data?.message || 'Failed to start call. Try again.');
    } finally {
      setJoining(false);
    }
  }, [appointmentId, apptInfo]);

  // ── After call ends ───────────────────────────────────────────────────────
  const handleEnd = useCallback(async () => {
    if (appointmentId) {
      try { await apiClient.delete(`/calls/room/${appointmentId}`); } catch {}
    }
    navigate('/gym-physio/appointments');
  }, [appointmentId, navigate]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  // ── Active call (full-screen) ─────────────────────────────────────────────
  if (started && roomData && apptInfo) {
    return (
      <VideoCallScreen
        appointmentId={appointmentId!}
        roomUrl={roomData.roomUrl}
        token={roomData.token}
        callMode={roomData.callMode}
        displayName="Provider"
        remoteDisplayName={apptInfo.clientName}
        remoteInitial={apptInfo.clientName.charAt(0).toUpperCase()}
        serviceTitle={apptInfo.serviceTitle}
        onEnd={handleEnd}
      />
    );
  }

  // ── Pre-call lobby ────────────────────────────────────────────────────────
  const name    = apptInfo?.clientName  || 'Client';
  const title   = apptInfo?.serviceTitle || 'Session';
  const initial = name.charAt(0).toUpperCase();
  const isPhone = apptInfo?.callMode === 'phone_call';

  const lobbyHints = isPhone
    ? [
        { icon: '🎙️', text: 'Microphone access required — no camera needed' },
        { icon: '🔒', text: 'End-to-end encrypted audio call' },
        { icon: '👤', text: 'Client joins from their appointments page' },
      ]
    : [
        { icon: '🎥', text: 'Allow camera & microphone when prompted' },
        { icon: '🔒', text: 'End-to-end encrypted video call' },
        { icon: '👤', text: 'Client joins from their appointments page' },
      ];

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="text-center max-w-sm w-full">

        {/* Avatar */}
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5 shadow-xl ring-4 ${
          isPhone
            ? 'bg-gradient-to-br from-green-500 to-emerald-600 ring-green-500/30'
            : 'bg-gradient-to-br from-blue-500 to-indigo-600 ring-blue-500/30'
        }`}>
          <span className="text-white font-bold text-4xl">{initial}</span>
        </div>

        <h2 className="text-xl font-bold text-white mb-1">{name}</h2>
        <p className="text-sm text-white/50 mb-1">{title}</p>
        <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-6 ${
          isPhone ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
        }`}>
          {isPhone ? '📞 Phone Call' : '📹 Video Call'}
        </span>

        {/* Hints */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 text-left space-y-2.5">
          {lobbyHints.map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="text-base flex-shrink-0">{item.icon}</span>
              <p className="text-sm text-white/60">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Join button */}
        <button
          onClick={handleJoin}
          disabled={joining}
          className={`w-full inline-flex items-center justify-center gap-2 py-4 font-bold text-base
                      rounded-2xl transition-all shadow-lg active:scale-95 disabled:opacity-60 text-white ${
            isPhone ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
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
              Start Phone Call
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

        <button onClick={() => navigate('/gym-physio/appointments')}
          className="mt-3 w-full py-3 text-sm text-white/40 hover:text-white/70 transition-colors">
          ← Back to Appointments
        </button>
      </div>
    </div>
  );
};

export default VideoCall;
