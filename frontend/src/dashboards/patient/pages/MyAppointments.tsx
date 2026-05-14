import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components';
import { appointmentsApi } from '../services/api';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { showSuccessToast, showErrorToast } from '../utils/toast';

type Tab = 'upcoming' | 'completed' | 'cancelled';

const STATUS_STYLES: Record<string, { badge: string; dot: string }> = {
  scheduled:  { badge: 'bg-blue-100 text-blue-700 border-blue-200',   dot: 'bg-blue-500' },
  confirmed:  { badge: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' },
  pending:    { badge: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  completed:  { badge: 'bg-gray-100 text-gray-600 border-gray-200',    dot: 'bg-gray-400' },
  cancelled:  { badge: 'bg-red-100 text-red-600 border-red-200',       dot: 'bg-red-500' },
  no_show:    { badge: 'bg-red-100 text-red-600 border-red-200',       dot: 'bg-red-400' },
};

const MODE_ICONS: Record<string, string> = {
  video_call: '📹', video: '📹',
  phone_call: '📞', chat: '📞',
  in_person: '🏥', 'in-person': '🏥',
};
const MODE_LABELS: Record<string, string> = {
  video_call: 'Video Call', video: 'Video Call',
  phone_call: 'Phone Call', chat: 'Phone Call',
  in_person: 'In-Person', 'in-person': 'In-Person',
};

// Avatar with initials fallback
const Avatar: React.FC<{ name: string; photo?: string | null; size?: string }> = ({ name, photo, size = 'w-12 h-12' }) => {
  const [err, setErr] = useState(false);
  const initials = (name || 'P').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'P';
  if (photo && photo.startsWith('http') && !err) {
    return <img src={photo} alt={name} className={`${size} rounded-2xl object-cover flex-shrink-0`} onError={() => setErr(true)} />;
  }
  return (
    <div className={`${size} rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-sm`}>
      <span className="text-white font-bold text-sm">{initials}</span>
    </div>
  );
};

const TABS: { value: Tab; label: string; icon: string }[] = [
  { value: 'upcoming',  label: 'Upcoming',  icon: '📅' },
  { value: 'completed', label: 'Completed', icon: '✅' },
  { value: 'cancelled', label: 'Cancelled', icon: '❌' },
];

const MyAppointments: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('upcoming');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [allAppointments, setAllAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [cancelModal, setCancelModal] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // Load all tabs on mount for stats
  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [activeTab]);

  const loadAll = async () => {
    try {
      const res = await appointmentsApi.getAppointments({});
      const data = (res.data?.data as any) ?? res.data ?? [];
      setAllAppointments(Array.isArray(data) ? data : []);
    } catch {}
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await appointmentsApi.getAppointments({ status: activeTab });
      const data = (res.data?.data as any) ?? res.data ?? [];
      setAppointments(Array.isArray(data) ? data : []);
    } catch { showErrorToast('Failed to load appointments'); }
    finally { setLoading(false); }
  };

  const handleCancel = async () => {
    if (!cancelModal) return;
    setActionLoading(cancelModal.id);
    try {
      await appointmentsApi.cancelAppointment(cancelModal.id, cancelReason);
      showSuccessToast('Appointment cancelled');
      setCancelModal(null); setCancelReason('');
      fetchAppointments();
      loadAll();
    } catch { showErrorToast('Failed to cancel appointment'); }
    finally { setActionLoading(null); }
  };

  // Stats from all appointments
  const stats = {
    upcoming:  allAppointments.filter(a => ['scheduled','confirmed','pending'].includes(a.status)).length,
    completed: allAppointments.filter(a => a.status === 'completed').length,
    cancelled: allAppointments.filter(a => ['cancelled','no_show'].includes(a.status)).length,
    unpaid:    allAppointments.filter(a => (a.payment?.status || 'pending') === 'pending' && (a.payment?.amount || a.consultationFee || 0) > 0).length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Appointments</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Manage your healthcare appointments</p>
          </div>
          <button onClick={() => navigate('/patient/browse-services')}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm w-full sm:w-auto">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Book New
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {[
            { label: 'Upcoming', value: stats.upcoming, icon: '📅', color: 'bg-blue-50 text-blue-600', tab: 'upcoming' as Tab },
            { label: 'Completed', value: stats.completed, icon: '✅', color: 'bg-green-50 text-green-600', tab: 'completed' as Tab },
            { label: 'Cancelled', value: stats.cancelled, icon: '❌', color: 'bg-red-50 text-red-500', tab: 'cancelled' as Tab },
            { label: 'Unpaid', value: stats.unpaid, icon: '💳', color: 'bg-amber-50 text-amber-600', tab: 'upcoming' as Tab },
          ].map(s => (
            <button key={s.label} onClick={() => setActiveTab(s.tab)}
              className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-4 text-left hover:border-blue-300 hover:shadow-sm transition-all">
              <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl ${s.color} flex items-center justify-center text-base sm:text-lg mb-1.5 sm:mb-2`}>{s.icon}</div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 sm:gap-2 bg-gray-100 p-1 rounded-xl sm:rounded-2xl overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab.value} onClick={() => setActiveTab(tab.value)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.value
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
              <span className="text-sm sm:text-base">{tab.icon}</span>
              <span className="hidden xs:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
            <div className="text-5xl mb-4">
              {activeTab === 'upcoming' ? '📅' : activeTab === 'completed' ? '✅' : '❌'}
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No {activeTab} appointments</h3>
            <p className="text-sm text-gray-500 mb-5">
              {activeTab === 'upcoming' ? 'Book a consultation to get started' : `No ${activeTab} appointments yet`}
            </p>
            {activeTab === 'upcoming' && (
              <button onClick={() => navigate('/patient/browse-services')}
                className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                Browse Services
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt: any) => {
              const id = apt.id || apt._id;
              const status = apt.status || 'scheduled';
              const style = STATUS_STYLES[status] || STATUS_STYLES.scheduled;
              const providerName = apt.provider?.name || apt.professionalName || 'Healthcare Provider';
              const providerSpecialty = apt.provider?.specialty || apt.provider?.type || '';
              const providerPhoto = apt.provider?.photo || null;
              const serviceTitle = apt.service?.title || apt.reasonForVisit || 'Consultation';
              const rawDate = apt.date || apt.scheduledDate;
              const time = apt.time || apt.scheduledTime || '';
              const mode = apt.type || apt.appointmentMode || 'in_person';
              const fee = apt.payment?.amount || apt.consultationFee || 0;
              const paymentStatus = apt.payment?.status || 'pending';
              const isBusy = actionLoading === id;
              const isUpcoming = activeTab === 'upcoming';
              const isCompleted = activeTab === 'completed';

              const formattedDate = rawDate ? format(new Date(rawDate), 'EEEE, MMM d, yyyy') : '—';
              const relDate = rawDate ? formatDistanceToNow(new Date(rawDate), { addSuffix: true }) : '';
              const dateIsPast = rawDate ? isPast(new Date(rawDate)) : false;

              return (
                <div key={id}
                  className={`bg-white rounded-2xl border overflow-hidden transition-all hover:shadow-md ${
                    isUpcoming && !dateIsPast ? 'border-gray-200' : 'border-gray-200 opacity-90'
                  }`}>
                  {/* Top accent */}
                  <div className={`h-1 ${
                    status === 'confirmed' ? 'bg-green-400' :
                    status === 'scheduled' ? 'bg-blue-400' :
                    status === 'completed' ? 'bg-gray-300' :
                    'bg-red-300'
                  }`} />

                  <div className="p-3 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <Avatar name={providerName} photo={providerPhoto} size="w-12 h-12 sm:w-14 sm:h-14" />

                      <div className="flex-1 min-w-0">
                        {/* Top row */}
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-gray-900 text-sm sm:text-base truncate">{providerName}</p>
                            {providerSpecialty && (
                              <p className="text-xs text-gray-500 capitalize mt-0.5 truncate">{providerSpecialty}</p>
                            )}
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs font-semibold border capitalize flex-shrink-0 ${style.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            <span className="hidden xs:inline">{status.replace(/_/g, ' ')}</span>
                          </span>
                        </div>

                        {/* Service */}
                        <p className="text-xs sm:text-sm text-blue-600 font-medium mt-1.5 line-clamp-1">{serviceTitle}</p>

                        {/* Info chips */}
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
                          <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-50 border border-gray-200 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
                            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="hidden sm:inline">{formattedDate}</span>
                            <span className="sm:hidden">{rawDate ? format(new Date(rawDate), 'MMM d') : '—'}</span>
                          </span>
                          {time && (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-50 border border-gray-200 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
                              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {time}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-50 border border-gray-200 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
                            <span className="text-sm">{MODE_ICONS[mode] || '🏥'}</span>
                            <span className="hidden sm:inline">{MODE_LABELS[mode] || mode}</span>
                          </span>
                          {fee > 0 && (
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border ${
                              paymentStatus === 'paid'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              💳 ₦{fee.toLocaleString()} · {paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3 sm:mt-4">
                          {/* Video Call Button for video appointments */}
                          {isUpcoming && (mode === 'video_call' || mode === 'video') && status === 'confirmed' && (
                            <button
                              onClick={() => navigate(`/patient/video-call/${id}`)}
                              className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-semibold rounded-lg sm:rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-md flex-1 sm:flex-initial">
                              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              <span className="hidden sm:inline">Join Video Call</span>
                              <span className="sm:hidden">Video</span>
                            </button>
                          )}
                          
                          {/* Phone Call Button for phone appointments */}
                          {isUpcoming && (mode === 'phone_call' || mode === 'chat') && status === 'confirmed' && apt.providerPhone && (
                            <a
                              href={`tel:${apt.providerPhone}`}
                              className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md flex-1 sm:flex-initial">
                              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              <span className="hidden sm:inline">Call Provider</span>
                              <span className="sm:hidden">Call</span>
                            </a>
                          )}
                          
                          {isUpcoming && apt.consultationLink && (
                            <a href={apt.consultationLink} target="_blank" rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Join Call
                            </a>
                          )}
                          {isUpcoming && fee > 0 && paymentStatus === 'pending' && (
                            <button onClick={() => navigate('/patient/payments')}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white text-xs font-semibold rounded-xl hover:bg-amber-600 transition-colors">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                              Pay Now
                            </button>
                          )}
                          {isUpcoming && (status === 'scheduled' || status === 'confirmed') && (
                            <button onClick={() => { setCancelModal(apt); setCancelReason(''); }} disabled={isBusy}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-red-600 text-xs font-semibold rounded-xl border border-red-200 hover:bg-red-50 disabled:opacity-50 transition-colors">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Cancel
                            </button>
                          )}
                          {isCompleted && (
                            <button onClick={() => navigate('/patient/medical-records')}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 text-xs font-semibold rounded-xl border border-green-200 hover:bg-green-100 transition-colors">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              View Records
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={e => { if (e.target === e.currentTarget) setCancelModal(null); }}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-base font-bold text-gray-900">Cancel Appointment</h3>
              <button onClick={() => setCancelModal(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                <Avatar name={cancelModal.provider?.name || 'Provider'} photo={cancelModal.provider?.photo} size="w-10 h-10" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{cancelModal.provider?.name || 'Provider'}</p>
                  <p className="text-xs text-gray-500">
                    {cancelModal.date ? format(new Date(cancelModal.date), 'MMM d, yyyy') : '—'} at {cancelModal.time || '—'}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                  Reason <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} rows={3}
                  placeholder="Let us know why you're cancelling..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3 bg-gray-50 rounded-b-2xl">
              <button onClick={() => setCancelModal(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                Keep Appointment
              </button>
              <button onClick={handleCancel} disabled={!!actionLoading}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors">
                {actionLoading ? 'Cancelling...' : 'Cancel Appointment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyAppointments;
