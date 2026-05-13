// Appointments Page — with Accept/Reject + patient notification

import React, { useState, useEffect } from 'react';
import { Appointment } from '../types';
import { appointmentsApi } from '../services/api';
import { toast } from 'react-toastify';
import { format, formatDistanceToNow } from 'date-fns';
import apiClient from '../services/apiClient';

const STATUS_STYLES: Record<string, { badge: string; dot: string }> = {
  scheduled:  { badge: 'bg-blue-100 text-blue-700 border-blue-200',   dot: 'bg-blue-500' },
  pending:    { badge: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  confirmed:  { badge: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' },
  completed:  { badge: 'bg-gray-100 text-gray-700 border-gray-200',    dot: 'bg-gray-400' },
  cancelled:  { badge: 'bg-red-100 text-red-700 border-red-200',       dot: 'bg-red-500' },
};

const STATUS_TABS = [
  { value: 'all',       label: 'All' },
  { value: 'scheduled', label: 'New' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentsApi.getAppointments();
      const normalized = (data as any[]).map((apt: any) => ({
        ...apt,
        id: apt._id || apt.id,
        date: apt.scheduledDate || apt.date,
        time: apt.scheduledTime || apt.time || '00:00',
        status: apt.status || 'scheduled',
        type: apt.appointmentMode || apt.type || 'in_person',
        patient: apt.patient || {
          id: apt.client?._id || '',
          name: apt.client?.user
            ? `${apt.client.user.firstName} ${apt.client.user.lastName}`.trim()
            : 'Patient',
          email: apt.client?.user?.email || '',
          photo: null,
        },
        service: apt.service || { id: '', title: apt.serviceName || 'Consultation', price: 0 },
        payment: apt.payment || { amount: apt.consultationFee || 0, status: apt.paymentStatus || 'pending' },
        reason: apt.reasonForVisit || apt.reason || '',
        notes: apt.clientNotes || apt.notes || '',
      }));
      setAppointments(normalized);
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const filtered = appointments.filter(apt =>
    statusFilter === 'all' || apt.status === statusFilter
  );

  const counts = STATUS_TABS.reduce((acc, tab) => {
    acc[tab.value] = tab.value === 'all'
      ? appointments.length
      : appointments.filter(a => a.status === tab.value).length;
    return acc;
  }, {} as Record<string, number>);

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      video_call: '📹 Video Call', phone_call: '📞 Phone Call',
      in_person: '🏥 In-Person', 'in-person': '🏥 In-Person',
      video: '📹 Video', chat: '💬 Chat',
    };
    return map[type] || type;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <p className="text-sm text-gray-500 mt-0.5">Review and manage your patient appointments</p>
      </div>

      {/* New bookings alert */}
      {counts['scheduled'] > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-900">
              {counts['scheduled']} new booking{counts['scheduled'] !== 1 ? 's' : ''} awaiting your response
            </p>
            <p className="text-xs text-blue-600">Accept or reject to notify the patient</p>
          </div>
          <button onClick={() => setStatusFilter('scheduled')}
            className="ml-auto text-xs font-semibold text-blue-600 hover:text-blue-700 bg-white border border-blue-200 px-3 py-1.5 rounded-lg">
            View New
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-200">
          {STATUS_TABS.map(tab => (
            <button key={tab.value} onClick={() => setStatusFilter(tab.value)}
              className={`flex-shrink-0 px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                statusFilter === tab.value
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}>
              {tab.label}
              {counts[tab.value] > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                  statusFilter === tab.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}>{counts[tab.value]}</span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No appointments</h3>
            <p className="text-sm text-gray-500">
              {statusFilter === 'all' ? 'No appointments yet' : `No ${statusFilter} appointments`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map(apt => {
              const style = STATUS_STYLES[apt.status] || STATUS_STYLES.scheduled;
              const initials = apt.patient.name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();
              return (
                <div key={apt.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="text-white text-sm font-bold">{initials}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-base font-bold text-gray-900">{apt.patient.name}</p>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border capitalize ${style.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                              {apt.status === 'scheduled' ? 'New Booking' : apt.status}
                            </span>
                          </div>
                          {apt.patient.email && (
                            <p className="text-xs text-gray-400">{apt.patient.email}</p>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {(apt.status === 'scheduled' || apt.status === 'pending') && (
                            <>
                              <button onClick={() => setSelectedAppointment(apt)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Accept
                              </button>
                              <button onClick={() => setSelectedAppointment({ ...apt, _action: 'reject' })}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50 border border-red-200 transition-colors">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Reject
                              </button>
                            </>
                          )}
                          {apt.status === 'confirmed' && (
                            <>
                              <button onClick={() => setSelectedAppointment({ ...apt, _action: 'message' })}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                                Send Message
                              </button>
                              <button onClick={() => setSelectedAppointment(apt)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 border border-gray-300 transition-colors">
                                View Details
                              </button>
                            </>
                          )}
                          {(apt.status === 'completed' || apt.status === 'cancelled') && (
                            <button onClick={() => setSelectedAppointment(apt)}
                              className="text-xs text-gray-500 hover:text-gray-700 underline">
                              View
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Details row */}
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <span className="font-medium text-blue-600">{apt.service?.title || 'Consultation'}</span>
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {apt.date ? format(new Date(apt.date), 'MMM d, yyyy') : '—'} at {apt.time}
                        </span>
                        <span className="text-xs text-gray-400">{getTypeLabel(apt.type)}</span>
                        {apt.payment?.amount > 0 && (
                          <span className="text-xs font-semibold text-green-600">
                            ₦{apt.payment.amount.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {apt.reason && (
                        <p className="text-xs text-gray-500 mt-1.5 italic">"{apt.reason}"</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Details / Accept / Reject Modal */}
      {selectedAppointment && (
        <AppointmentModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onUpdate={() => { fetchAppointments(); setSelectedAppointment(null); }}
        />
      )}
    </div>
  );
};

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  appointment: any;
  onClose: () => void;
  onUpdate: () => void;
}

const AppointmentModal: React.FC<ModalProps> = ({ appointment, onClose, onUpdate }) => {
  const [notes, setNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const isRejectMode = appointment._action === 'reject';
  const isMessageMode = appointment._action === 'message';

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }
    setLoading(true);
    try {
      // Use the correct API endpoint
      const response = await apiClient.post(`/professionals/appointments/${appointment.id}/notify-patient`, {
        message: message.trim(),
        type: 'message_from_provider',
      });
      
      console.log('Message sent response:', response.data);
      toast.success('Message sent to patient successfully!');
      setMessage('');
      onClose();
    } catch (error: any) {
      console.error('Failed to send message:', error);
      toast.error(error?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setLoading(true);
    try {
      await appointmentsApi.confirmAppointment(appointment.id, notes);
      // Send notification to patient
      await apiClient.post(`/professionals/appointments/${appointment.id}/notify-patient`, {
        message: notes
          ? `Your appointment has been confirmed. Note from your provider: ${notes}`
          : 'Your appointment has been confirmed by the healthcare provider.',
        type: 'appointment_confirmed',
      }).catch(() => {}); // non-fatal
      toast.success('Appointment accepted — patient notified!');
      onUpdate();
    } catch {
      toast.error('Failed to accept appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    setLoading(true);
    try {
      await appointmentsApi.cancelAppointment(appointment.id, rejectReason);
      // Send notification to patient
      await apiClient.post(`/professionals/appointments/${appointment.id}/notify-patient`, {
        message: `Your appointment request has been declined. Reason: ${rejectReason}`,
        type: 'appointment_rejected',
      }).catch(() => {});
      toast.success('Appointment rejected — patient notified');
      onUpdate();
    } catch {
      toast.error('Failed to reject appointment');
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
    } catch {
      toast.error('Failed to complete appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this appointment?')) return;
    setLoading(true);
    try {
      await appointmentsApi.cancelAppointment(appointment.id, 'Cancelled by professional');
      toast.success('Appointment cancelled');
      onUpdate();
    } catch {
      toast.error('Failed to cancel appointment');
    } finally {
      setLoading(false);
    }
  };

  const initials = appointment.patient.name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            {isRejectMode ? 'Reject Appointment' : isMessageMode ? 'Send Message to Patient' : 'Appointment Details'}
          </h2>
          <button onClick={onClose} disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Patient */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">{initials}</span>
            </div>
            <div>
              <p className="font-bold text-gray-900">{appointment.patient.name}</p>
              {appointment.patient.email && (
                <p className="text-xs text-gray-500">{appointment.patient.email}</p>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 text-sm">
            {[
              { label: 'Service', value: appointment.service?.title || 'Consultation' },
              { label: 'Date', value: appointment.date ? format(new Date(appointment.date), 'EEEE, MMMM d, yyyy') : '—' },
              { label: 'Time', value: appointment.time },
              { label: 'Type', value: appointment.type?.replace(/_/g, ' ') },
              { label: 'Status', value: appointment.status },
              { label: 'Fee', value: appointment.payment?.amount > 0 ? `₦${appointment.payment.amount.toLocaleString()}` : 'Free' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-1.5 border-b border-gray-100 last:border-0">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-gray-900 capitalize">{value}</span>
              </div>
            ))}
          </div>

          {appointment.reason && (
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-blue-700 mb-1">Reason for Visit</p>
              <p className="text-sm text-blue-900">{appointment.reason}</p>
            </div>
          )}

          {/* Accept notes */}
          {!isRejectMode && (appointment.status === 'scheduled' || appointment.status === 'pending') && (
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                Message to Patient <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                disabled={loading}
                placeholder="Add any instructions or notes for the patient..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none disabled:bg-gray-50" />
            </div>
          )}

          {/* Reject reason */}
          {isRejectMode && (
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                Reason for Rejection <span className="text-red-500">*</span>
              </label>
              <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3}
                disabled={loading}
                placeholder="Please explain why you are rejecting this appointment..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none disabled:bg-gray-50" />
              <p className="text-xs text-gray-400 mt-1">This reason will be sent to the patient.</p>
            </div>
          )}

          {/* Message mode */}
          {isMessageMode && (
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                Your Message <span className="text-blue-500">*</span>
              </label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4}
                disabled={loading}
                placeholder="Type your message to the patient here..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none disabled:bg-gray-50" />
              <p className="text-xs text-gray-400 mt-1">This message will be sent to the patient via notification.</p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3 bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} disabled={loading}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors">
            Cancel
          </button>

          {isMessageMode && (
            <button onClick={handleSendMessage} disabled={loading || !message.trim()}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {loading ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
              Send Message
            </button>
          )}

          {isRejectMode && (
            <button onClick={handleReject} disabled={loading || !rejectReason.trim()}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors">
              {loading ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              Reject & Notify Patient
            </button>
          )}

          {!isRejectMode && !isMessageMode && (appointment.status === 'scheduled' || appointment.status === 'pending') && (
            <button onClick={handleAccept} disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors">
              {loading ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              Accept & Notify Patient
            </button>
          )}

          {!isRejectMode && !isMessageMode && appointment.status === 'confirmed' && (
            <>
              <button onClick={handleComplete} disabled={loading}
                className="flex-1 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors">
                Mark Completed
              </button>
              <button onClick={handleCancel} disabled={loading}
                className="px-4 py-2.5 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 disabled:opacity-50 transition-colors">
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;
