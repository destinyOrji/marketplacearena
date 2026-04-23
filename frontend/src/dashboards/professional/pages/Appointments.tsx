// Appointments Page - Manage appointments

import React, { useState, useEffect } from 'react';
import { Appointment } from '../types';
import { appointmentsApi } from '../services/api';
import { toast } from 'react-toastify';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentsApi.getAppointments();
      // Normalize data - backend may return different field names
      const normalized = data.map((apt: any) => ({
        ...apt,
        id: apt._id || apt.id,
        date: apt.scheduledDate || apt.date,
        time: apt.scheduledTime || apt.time || '00:00',
        status: apt.status || 'pending',
        type: apt.appointmentType || apt.type || 'in-person',
        patient: apt.patient || {
          id: apt.client?._id || apt.clientId || '',
          name: apt.client?.user ? `${apt.client.user.firstName} ${apt.client.user.lastName}` : apt.patientName || 'Patient',
          photo: apt.client?.profilePhoto || null,
        },
        service: apt.service || {
          id: apt.serviceId || '',
          title: apt.serviceName || apt.serviceTitle || 'Consultation',
          price: apt.price || 0,
        },
        payment: apt.payment || {
          amount: apt.price || apt.amount || 0,
          status: apt.paymentStatus || 'pending',
        },
      }));
      setAppointments(normalized);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter((apt) =>
    statusFilter === 'all' || apt.status === statusFilter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  // Check if appointment is within 24 hours
  const isUpcoming = (appointment: Appointment) => {
    const appointmentTime = new Date(appointment.date).getTime();
    const now = new Date().getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return appointmentTime - now <= twentyFourHours && appointmentTime > now;
  };

  // Calendar view helpers
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getAppointmentsForDay = (day: Date) => {
    return filteredAppointments.filter((apt) => isSameDay(new Date(apt.date), day));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Appointments</h1>
        <p className="text-gray-600">View and manage your scheduled appointments</p>
      </div>

      {/* Filters and View Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap" role="group" aria-label="Filter appointments by status">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-pressed={statusFilter === status}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2" role="group" aria-label="Calendar view mode">
            {['day', 'week', 'month'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-pressed={viewMode === mode}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Appointments Alert */}
      {filteredAppointments.some(isUpcoming) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-yellow-900 mb-1">Upcoming Appointments</h3>
              <p className="text-sm text-yellow-800">
                You have {filteredAppointments.filter(isUpcoming).length} appointment(s) within the next 24 hours
              </p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : viewMode === 'month' ? (
        /* Calendar View */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {daysInMonth.map((day) => {
              const dayAppointments = getAppointmentsForDay(day);
              return (
                <div
                  key={day.toString()}
                  className={`min-h-[100px] border border-gray-200 rounded-lg p-2 ${
                    isToday(day) ? 'bg-blue-50 border-blue-300' : 'bg-white'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayAppointments.slice(0, 2).map((apt) => (
                      <button
                        key={apt.id}
                        onClick={() => handleViewDetails(apt)}
                        className={`w-full text-left text-xs p-1 rounded border ${getStatusColor(apt.status)} hover:opacity-80`}
                      >
                        <div className="font-medium truncate">{apt.time}</div>
                        <div className="truncate">{apt.patient.name}</div>
                      </button>
                    ))}
                    {dayAppointments.length > 2 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayAppointments.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments</h3>
              <p className="text-gray-600">
                {statusFilter === 'all'
                  ? 'You have no scheduled appointments'
                  : `No ${statusFilter} appointments`}
              </p>
            </div>
          ) : (
            filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {appointment.patient.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                      {isUpcoming(appointment) && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          Upcoming
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2">{appointment.service.title}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {format(new Date(appointment.date), 'MMM dd, yyyy')}
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {appointment.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      ${appointment.payment.amount}
                    </p>
                    <p className="text-sm text-gray-600">
                      {appointment.payment.status === 'completed' ? 'Paid' : 'Pending'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDetails(appointment)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Appointment Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedAppointment(null);
          }}
          onUpdate={fetchAppointments}
        />
      )}
    </div>
  );
};

// Appointment Details Modal Component
interface AppointmentDetailsModalProps {
  appointment: Appointment;
  onClose: () => void;
  onUpdate: () => void;
}

const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  appointment,
  onClose,
  onUpdate,
}) => {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await appointmentsApi.confirmAppointment(appointment.id, notes);
      toast.success('Appointment confirmed');
      onUpdate();
      onClose();
    } catch (error) {
      toast.error('Failed to confirm appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    
    setLoading(true);
    try {
      await appointmentsApi.cancelAppointment(appointment.id, 'Cancelled by professional');
      toast.success('Appointment cancelled');
      onUpdate();
      onClose();
    } catch (error) {
      toast.error('Failed to cancel appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await appointmentsApi.completeAppointment(appointment.id);
      toast.success('Appointment marked as completed');
      onUpdate();
      onClose();
    } catch (error) {
      toast.error('Failed to complete appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Appointment Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Patient Info */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Patient Information</h3>
            <div className="flex items-center gap-3">
              {appointment.patient.photo ? (
                <img
                  src={appointment.patient.photo}
                  alt={`${appointment.patient.name} profile picture`}
                  className="w-12 h-12 rounded-full"
                  loading="lazy"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">
                    {appointment.patient.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">{appointment.patient.name}</p>
                <p className="text-sm text-gray-600">Patient ID: {appointment.patient.id}</p>
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Appointment Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span className="font-medium text-gray-900">{appointment.service.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium text-gray-900">
                  {format(new Date(appointment.date), 'MMMM dd, yyyy')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium text-gray-900">{appointment.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium text-gray-900">
                  {appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-gray-900">
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment:</span>
                <span className="font-medium text-gray-900">
                  ${appointment.payment.amount} ({appointment.payment.status})
                </span>
              </div>
            </div>
          </div>

          {/* Notes (for confirmation) */}
          {appointment.status === 'pending' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add any notes or special instructions..."
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            {appointment.status === 'pending' && (
              <>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Confirm Appointment'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                >
                  Cancel
                </button>
              </>
            )}
            {appointment.status === 'confirmed' && (
              <>
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Mark as Completed
                </button>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                >
                  Cancel
                </button>
              </>
            )}
            {(appointment.status === 'completed' || appointment.status === 'cancelled') && (
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
