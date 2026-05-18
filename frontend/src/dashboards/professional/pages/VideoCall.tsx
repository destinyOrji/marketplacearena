// Professional Video Call — WhatsApp-style UI via shared VideoCallScreen
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiClient from '../services/apiClient';
import VideoCallScreen from '../../../components/VideoCallScreen';

const VideoCall: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (started && appointmentId) {
    const patientName = appointment?.patientName || 'Patient';
    return (
      <VideoCallScreen
        appointmentId={appointmentId}
        displayName="Provider"
        remoteDisplayName={patientName}
        remoteInitial={patientName.charAt(0).toUpperCase()}
        serviceTitle={appointment?.serviceTitle}
        onEnd={() => navigate('/professional/appointments')}
      />
    );
  }

  // Pre-call lobby
  const patientName = appointment?.patientName || 'Patient';
  const serviceTitle = appointment?.serviceTitle || 'Consultation';
  const initial = patientName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="text-center max-w-sm w-full">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-5 shadow-xl ring-4 ring-blue-500/30">
          <span className="text-white font-bold text-4xl">{initial}</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-1">{patientName}</h2>
        <p className="text-sm text-white/50 mb-6">{serviceTitle}</p>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 text-left space-y-2.5">
          {[
            { icon: '🎥', text: 'Allow camera & microphone when prompted' },
            { icon: '🔒', text: 'End-to-end encrypted call' },
            { icon: '👤', text: 'Patient joins from their appointments page' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="text-base flex-shrink-0">{item.icon}</span>
              <p className="text-sm text-white/60">{item.text}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => setStarted(true)}
          className="w-full inline-flex items-center justify-center gap-2 py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-base rounded-2xl transition-all shadow-lg active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Join Video Call
        </button>
        <button onClick={() => navigate('/professional/appointments')}
          className="mt-3 w-full py-3 text-sm text-white/40 hover:text-white/70 transition-colors">
          ← Back to Appointments
        </button>
      </div>
    </div>
  );
};

export default VideoCall;
