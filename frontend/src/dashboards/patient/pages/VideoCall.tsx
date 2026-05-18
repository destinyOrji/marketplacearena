// Patient Video Call — WhatsApp-style UI via shared VideoCallScreen
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components';
import { appointmentsApi } from '../services/api';
import { showErrorToast } from '../utils/toast';
import VideoCallScreen from '../../../components/VideoCallScreen';

const VideoCall: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!appointmentId) return;
    appointmentsApi.getAppointmentById(appointmentId)
      .then(res => {
        const data = (res as any).data?.data || (res as any).data;
        if (!data) throw new Error('Not found');
        setAppointment(data);
      })
      .catch(() => {
        showErrorToast('Failed to load appointment');
        setTimeout(() => navigate('/patient/appointments'), 2000);
      })
      .finally(() => setLoading(false));
  }, [appointmentId, navigate]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-600 border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  if (started && appointmentId) {
    const providerName = appointment?.provider?.name || appointment?.professionalName || 'Healthcare Provider';
    return (
      <VideoCallScreen
        appointmentId={appointmentId}
        displayName="Patient"
        remoteDisplayName={providerName}
        remoteInitial={providerName.charAt(0).toUpperCase()}
        serviceTitle={appointment?.service?.title || appointment?.reasonForVisit || 'Consultation'}
        onEnd={() => navigate('/patient/appointments')}
      />
    );
  }

  // Pre-call lobby
  const providerName = appointment?.provider?.name || appointment?.professionalName || 'Healthcare Provider';
  const serviceTitle = appointment?.service?.title || appointment?.reasonForVisit || 'Consultation';
  const initial = providerName.charAt(0).toUpperCase();

  return (
    <DashboardLayout>
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="text-center max-w-sm w-full">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-5 shadow-xl ring-4 ring-blue-100">
            <span className="text-white font-bold text-4xl">{initial}</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">{providerName}</h2>
          <p className="text-sm text-gray-500 mb-6">{serviceTitle}</p>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6 text-left space-y-2.5">
            {[
              { icon: '🎥', text: 'Allow camera & microphone when prompted' },
              { icon: '🔒', text: 'End-to-end encrypted call' },
              { icon: '📱', text: 'Works on mobile and desktop' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="text-base flex-shrink-0">{item.icon}</span>
                <p className="text-sm text-gray-600">{item.text}</p>
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
