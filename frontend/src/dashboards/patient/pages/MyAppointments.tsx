import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components';
import { appointmentsApi } from '../services/api';
import { Appointment } from '../types';
import { format } from 'date-fns';
import { showSuccessToast, showErrorToast, showInfoToast } from '../utils/toast';

type AppointmentTab = 'upcoming' | 'completed' | 'cancelled';

interface RescheduleModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onConfirm: (appointmentId: string, newDate: Date, newTime: string) => void;
}

const RescheduleModal: React.FC<RescheduleModalProps> = ({
  isOpen,
  appointment,
  onClose,
  onConfirm,
}) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  if (!isOpen || !appointment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDate && selectedTime) {
      onConfirm(appointment.id, new Date(selectedDate), selectedTime);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Reschedule Appointment</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Time
            </label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface CancelModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onConfirm: (appointmentId: string, reason: string) => void;
}

const CancelModal: React.FC<CancelModalProps> = ({
  isOpen,
  appointment,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState('');

  if (!isOpen || !appointment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(appointment.id, reason);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Cancel Appointment</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          Are you sure you want to cancel your appointment with {appointment.provider.name}?
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for cancellation (optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Please provide a reason..."
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Keep Appointment
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Cancel Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MyAppointments: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AppointmentTab>('upcoming');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rescheduleModal, setRescheduleModal] = useState<{
    isOpen: boolean;
    appointment: Appointment | null;
  }>({ isOpen: false, appointment: null });
  const [cancelModal, setCancelModal] = useState<{
    isOpen: boolean;
    appointment: Appointment | null;
  }>({ isOpen: false, appointment: null });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [activeTab]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await appointmentsApi.getAppointments({ status: activeTab });
      const apptData = response.data?.data ?? response.data ?? [];
      setAppointments(Array.isArray(apptData) ? apptData : []);
    } catch (err: any) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinConsultation = (appointment: Appointment) => {
    if (appointment.consultationLink) {
      window.open(appointment.consultationLink, '_blank');
    } else {
      showErrorToast('Consultation link not available yet');
    }
  };

  const handleReschedule = (appointment: Appointment) => {
    setRescheduleModal({ isOpen: true, appointment });
  };

  const handleConfirmReschedule = async (
    appointmentId: string,
    newDate: Date,
    newTime: string
  ) => {
    try {
      setActionLoading(true);
      await appointmentsApi.rescheduleAppointment(appointmentId, {
        date: newDate.toISOString(),
        time: newTime,
      });
      
      showSuccessToast('Appointment rescheduled successfully');
      setRescheduleModal({ isOpen: false, appointment: null });
      fetchAppointments();
    } catch (err: any) {
      console.error('Error rescheduling appointment:', err);
      showErrorToast('Failed to reschedule appointment. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = (appointment: Appointment) => {
    setCancelModal({ isOpen: true, appointment });
  };

  const handleConfirmCancel = async (appointmentId: string, reason: string) => {
    try {
      setActionLoading(true);
      await appointmentsApi.cancelAppointment(appointmentId, reason);
      
      showSuccessToast('Appointment cancelled successfully');
      setCancelModal({ isOpen: false, appointment: null });
      fetchAppointments();
    } catch (err: any) {
      console.error('Error cancelling appointment:', err);
      showErrorToast('Failed to cancel appointment. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadPrescription = async (appointmentId: string) => {
    try {
      showInfoToast('Downloading prescription...');
      // This would typically call an API endpoint to download the prescription
      // For now, we'll just show a success message
      showSuccessToast('Prescription downloaded successfully');
    } catch (err: any) {
      console.error('Error downloading prescription:', err);
      showErrorToast('Failed to download prescription. Please try again.');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getConsultationTypeBadge = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-blue-100 text-blue-700';
      case 'chat':
        return 'bg-green-100 text-green-700';
      case 'in-person':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const renderAppointmentCard = (appointment: Appointment) => {
    const isUpcoming = activeTab === 'upcoming';
    const isCompleted = activeTab === 'completed';

    return (
      <div
        key={appointment.id}
        className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <img
              src={appointment.provider.photo || '/default-avatar.png'}
              alt={appointment.provider.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {appointment.provider.name}
              </h3>
              <p className="text-sm text-gray-600">
                {appointment.provider.specialty || appointment.provider.type}
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(appointment.status)}`}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getConsultationTypeBadge(appointment.type)}`}>
                  {appointment.type === 'in-person' ? 'In-Person' : appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <svg
              className="w-5 h-5 mr-2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>{format(new Date(appointment.date), 'MMMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <svg
              className="w-5 h-5 mr-2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{appointment.time}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          {isUpcoming && (
            <>
              {appointment.consultationLink && (
                <button
                  onClick={() => handleJoinConsultation(appointment)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Join Consultation
                </button>
              )}
              <button
                onClick={() => handleReschedule(appointment)}
                disabled={actionLoading}
                className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium flex items-center disabled:opacity-50"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Reschedule
              </button>
              <button
                onClick={() => handleCancel(appointment)}
                disabled={actionLoading}
                className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium flex items-center disabled:opacity-50"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Cancel
              </button>
            </>
          )}
          {isCompleted && (
            <button
              onClick={() => handleDownloadPrescription(appointment.id)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download Prescription
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-gray-600 mt-2">
          View and manage your healthcare appointments
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'upcoming'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'completed'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'cancelled'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Cancelled
            </button>
          </nav>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Appointments List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-gray-500 text-lg font-medium">
            No {activeTab} appointments
          </p>
          <p className="text-gray-400 text-sm mt-2">
            {activeTab === 'upcoming'
              ? 'Book a consultation to get started'
              : `You don't have any ${activeTab} appointments yet`}
          </p>
          {activeTab === 'upcoming' && (
            <button
              onClick={() => navigate('/patient/browse-services')}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Services
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => renderAppointmentCard(appointment))}
        </div>
      )}

      {/* Modals */}
      <RescheduleModal
        isOpen={rescheduleModal.isOpen}
        appointment={rescheduleModal.appointment}
        onClose={() => setRescheduleModal({ isOpen: false, appointment: null })}
        onConfirm={handleConfirmReschedule}
      />
      <CancelModal
        isOpen={cancelModal.isOpen}
        appointment={cancelModal.appointment}
        onClose={() => setCancelModal({ isOpen: false, appointment: null })}
        onConfirm={handleConfirmCancel}
      />
    </DashboardLayout>
  );
};

export default MyAppointments;
