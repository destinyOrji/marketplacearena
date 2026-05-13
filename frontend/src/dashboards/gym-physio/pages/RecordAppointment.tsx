// Record Appointment Page - For confirmed appointments with video/call/location features

import React, { useEffect, useState } from 'react';
import { getAppointments } from '../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';

const RecordAppointment: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [locationMessage, setLocationMessage] = useState('');
  const [sendingLocation, setSendingLocation] = useState(false);

  useEffect(() => {
    fetchConfirmedAppointments();
  }, []);

  const fetchConfirmedAppointments = async () => {
    setLoading(true);
    try {
      const data = await getAppointments();
      const confirmed = (Array.isArray(data) ? data : [])
        .filter((apt: any) => apt.status === 'confirmed')
        .map((apt: any) => ({
          ...apt,
          id: apt._id || apt.id,
          date: apt.scheduledDate || apt.date,
          time: apt.scheduledTime || apt.time || '—',
          type: apt.appointmentMode || apt.type || 'in_person',
          patient: apt.patient || {
            id: apt.client?._id || '',
            name: apt.client?.user
              ? `${apt.client.user.firstName} ${apt.client.user.lastName}`.trim()
              : 'Client',
            email: apt.client?.user?.email || '',
            phone: apt.client?.user?.phone || apt.client?.phone || '',
          },
          service: apt.service || { title: apt.serviceName || 'Session' },
        }));
      setAppointments(confirmed);
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const getToken = () => localStorage.getItem('gymPhysioToken') || localStorage.getItem('authToken') || '';

  const sendLocationToPatient = async (appointmentId: string) => {
    if (!locationMessage.trim()) {
      toast.error('Please enter location details');
      return;
    }
    setSendingLocation(true);
    try {
      await axios.post(
        `${API_URL}/gym-physio/appointments/${appointmentId}/notify-patient`,
        {
          message: `📍 Location for your appointment: ${locationMessage}`,
          type: 'location_info',
        },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      toast.success('Location sent to patient!');
      setLocationMessage('');
      setSelectedAppointment(null);
    } catch {
      toast.error('Failed to send location');
    } finally {
      setSendingLocation(false);
    }
  };

  const handleVideoCall = (appointmentId: string) => {
    // Open video call in new window
    window.open(`/gym-physio/video-call/${appointmentId}`, '_blank');
  };

  const handlePhoneCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Record Appointments</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage confirmed appointments with video/call sessions and location sharing
        </p>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
          <div className="text-5xl mb-4">📅</div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">No confirmed appointments</h3>
          <p className="text-sm text-gray-500">Confirmed appointments will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {appointments.map((apt: any) => {
            const initials = (apt.patient?.name || 'C')
              .split(' ')
              .slice(0, 2)
              .map((w: string) => w[0])
              .join('')
              .toUpperCase();

            return (
              <div
                key={apt.id}
                className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                {/* Patient Info */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">{initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-lg">{apt.patient?.name}</h3>
                    {apt.patient?.email && (
                      <p className="text-xs text-gray-500 truncate">{apt.patient.email}</p>
                    )}
                    {apt.patient?.phone && (
                      <p className="text-xs text-gray-400">{apt.patient.phone}</p>
                    )}
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Service</span>
                    <span className="font-medium text-gray-900">{apt.service?.title}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Date</span>
                    <span className="font-medium text-gray-900">
                      {apt.date ? format(new Date(apt.date), 'MMM d, yyyy') : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Time</span>
                    <span className="font-medium text-gray-900">{apt.time}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Mode</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {apt.type === 'video_call'
                        ? '📹 Video Call'
                        : apt.type === 'phone_call'
                        ? '📞 Phone Call'
                        : '🏥 In-Person'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {apt.type === 'video_call' && (
                    <button
                      onClick={() => handleVideoCall(apt.id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-md">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      Start Video Call
                    </button>
                  )}

                  {apt.type === 'phone_call' && apt.patient?.phone && (
                    <button
                      onClick={() => handlePhoneCall(apt.patient.phone)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      Call Patient
                    </button>
                  )}

                  {apt.type === 'in_person' && (
                    <button
                      onClick={() => setSelectedAppointment(apt)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl hover:from-orange-700 hover:to-red-700 transition-all shadow-md">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Send Location
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Location Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Send Location to Patient</h3>
            <p className="text-sm text-gray-600 mb-4">
              Patient: <strong>{selectedAppointment.patient?.name}</strong>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location Details <span className="text-red-500">*</span>
              </label>
              <textarea
                value={locationMessage}
                onChange={(e) => setLocationMessage(e.target.value)}
                rows={4}
                placeholder="Enter your location address, landmarks, or directions..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedAppointment(null);
                  setLocationMessage('');
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium">
                Cancel
              </button>
              <button
                onClick={() => sendLocationToPatient(selectedAppointment.id)}
                disabled={sendingLocation || !locationMessage.trim()}
                className="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 disabled:opacity-50 text-sm font-semibold">
                {sendingLocation ? 'Sending...' : 'Send Location'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordAppointment;
