import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAppointments } from '../services/api';

const VideoCall: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [callStarted, setCallStarted] = useState(false);

  useEffect(() => {
    fetchAppointment();
  }, [appointmentId]);

  const fetchAppointment = async () => {
    try {
      const data = await getAppointments();
      const apt = (Array.isArray(data) ? data : []).find(
        (a: any) => (a._id || a.id) === appointmentId
      );
      if (apt) {
        setAppointment({
          ...apt,
          patient: apt.patient || {
            name: apt.client?.user
              ? `${apt.client.user.firstName} ${apt.client.user.lastName}`.trim()
              : 'Client',
          },
        });
      }
    } catch (error) {
      console.error('Failed to load appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCall = () => {
    setCallStarted(true);
  };

  const handleEndCall = () => {
    navigate('/gym-physio/record-appointment');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Appointment Not Found</h2>
          <button
            onClick={() => navigate('/gym-physio/record-appointment')}
            className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700">
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">
              Video Call with {appointment.patient?.name}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {appointment.service?.title || 'Session'}
            </p>
          </div>
          <button
            onClick={handleEndCall}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            End Call
          </button>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 flex items-center justify-center p-6">
        {!callStarted ? (
          <div className="text-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-6">
              <span className="text-white font-bold text-4xl">
                {appointment.patient?.name?.charAt(0).toUpperCase() || 'C'}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Ready to start video call?
            </h2>
            <p className="text-gray-400 mb-8">
              Click the button below to begin your session
            </p>
            <button
              onClick={handleStartCall}
              className="px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold text-lg flex items-center gap-3 mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Start Video Call
            </button>
          </div>
        ) : (
          <div className="w-full max-w-6xl">
            {/* Video Placeholder */}
            <div className="relative bg-gray-800 rounded-2xl overflow-hidden aspect-video mb-6">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-3xl">
                      {appointment.patient?.name?.charAt(0).toUpperCase() || 'C'}
                    </span>
                  </div>
                  <p className="text-white text-lg font-semibold">
                    {appointment.patient?.name}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">Connected</p>
                </div>
              </div>

              {/* Self Video (Picture-in-Picture) */}
              <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-700 rounded-lg border-2 border-gray-600 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold text-xl">You</span>
                  </div>
                  <p className="text-white text-xs">Your Video</p>
                </div>
              </div>

              {/* Call Duration */}
              <div className="absolute top-4 left-4 bg-black bg-opacity-50 px-4 py-2 rounded-lg">
                <p className="text-white text-sm font-mono">
                  <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                  Recording...
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <button className="w-14 h-14 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              </button>
              <button className="w-14 h-14 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
              <button
                onClick={handleEndCall}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <button className="w-14 h-14 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </button>
            </div>

            {/* Info Banner */}
            <div className="mt-6 bg-blue-900 bg-opacity-50 border border-blue-700 rounded-lg p-4 text-center">
              <p className="text-blue-200 text-sm">
                💡 <strong>Note:</strong> This is a placeholder video call interface. Integrate with a real video
                calling service like Twilio, Agora, or Zoom SDK for production use.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCall;
