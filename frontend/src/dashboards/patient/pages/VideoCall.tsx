import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components';
import { appointmentsApi } from '../services/api';
import { showErrorToast, showSuccessToast } from '../utils/toast';

const VideoCall: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [callStatus, setCallStatus] = useState<'waiting' | 'connected' | 'ended'>('waiting');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (appointmentId) {
      fetchAppointment();
      initializeMedia();
    }
    return () => {
      // Cleanup media stream on unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [appointmentId]);

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      const response = await appointmentsApi.getAppointmentById(appointmentId!);
      const data = response.data?.data || response.data;
      
      if (!data) {
        throw new Error('Appointment not found');
      }
      
      setAppointment(data);
    } catch (error: any) {
      console.error('Failed to load appointment:', error);
      showErrorToast(error?.message || 'Failed to load appointment details');
      setTimeout(() => navigate('/patient/appointments'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const initializeMedia = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCallStatus('connected');
      showSuccessToast('Camera and microphone connected');
    } catch (error: any) {
      console.error('Error accessing media devices:', error);
      let errorMessage = 'Could not access camera/microphone.';
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = 'Camera/microphone permission denied. Please allow access in your browser settings.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = 'No camera or microphone found. Please connect a device.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = 'Camera/microphone is already in use by another application.';
      }
      
      showErrorToast(errorMessage);
      setCallStatus('waiting');
    }
  };

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const endCall = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setCallStatus('ended');
    showSuccessToast('Call ended');
    setTimeout(() => navigate('/patient/appointments'), 1500);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading video call...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const providerName = appointment?.provider?.name || appointment?.professionalName || 'Healthcare Provider';
  const serviceTitle = appointment?.service?.title || appointment?.reasonForVisit || 'Consultation';

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-120px)] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{providerName}</h1>
              <p className="text-blue-100 text-sm">{serviceTitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${callStatus === 'connected' ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></div>
              <span className="text-sm font-medium capitalize">{callStatus}</span>
            </div>
          </div>
        </div>

        {/* Video Area */}
        <div className="flex-1 bg-gray-900 relative">
          {callStatus === 'ended' ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">Call Ended</h2>
                <p className="text-gray-400">Redirecting to appointments...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Main Video (Your Video) */}
              <div className="absolute inset-0">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {isVideoOff && (
                  <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <p className="text-lg font-semibold">Camera Off</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Provider Video (Picture-in-Picture) */}
              <div className="absolute top-4 right-4 w-64 h-48 bg-gray-800 rounded-xl overflow-hidden shadow-2xl border-2 border-white">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl font-bold">{providerName.charAt(0).toUpperCase()}</span>
                    </div>
                    <p className="text-sm font-medium">{providerName}</p>
                    <p className="text-xs text-gray-400 mt-1">Waiting to join...</p>
                  </div>
                </div>
              </div>

              {/* Call Info Overlay */}
              <div className="absolute top-4 left-4 bg-black bg-opacity-50 backdrop-blur-sm text-white px-4 py-2 rounded-xl">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Video Call Active</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Controls */}
        {callStatus !== 'ended' && (
          <div className="bg-gray-800 px-6 py-4 rounded-b-2xl">
            <div className="flex items-center justify-center gap-4">
              {/* Mute Button */}
              <button
                onClick={toggleMute}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                  isMuted
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </button>

              {/* Video Toggle Button */}
              <button
                onClick={toggleVideo}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                  isVideoOff
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
              >
                {isVideoOff ? (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>

              {/* End Call Button */}
              <button
                onClick={endCall}
                className="w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-all shadow-lg"
                title="End call"
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                </svg>
              </button>

              {/* Settings Button */}
              <button
                className="w-14 h-14 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-all"
                title="Settings"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>

            {/* Status Text */}
            <div className="text-center mt-4">
              <p className="text-gray-400 text-sm">
                {callStatus === 'waiting' && 'Waiting for provider to join...'}
                {callStatus === 'connected' && 'Connected - Video call in progress'}
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VideoCall;
