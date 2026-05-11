import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout, PaymentModal } from '../components';
import { servicesApi, appointmentsApi } from '../services/api';
import { ServiceProvider, TimeSlot } from '../types';
import { showSuccessToast, showErrorToast, showWarningToast, showInfoToast } from '../utils/toast';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';

// ─── Provider Avatar ──────────────────────────────────────────────────────────
const Avatar: React.FC<{ name: string; photo?: string | null; size?: string }> = ({
  name, photo, size = 'w-14 h-14',
}) => {
  const [err, setErr] = useState(false);
  const initials = (name || 'P').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  if (photo && photo.startsWith('http') && !err) {
    return <img src={photo} alt={name} className={`${size} rounded-2xl object-cover flex-shrink-0`} onError={() => setErr(true)} />;
  }
  return (
    <div className={`${size} rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-sm`}>
      <span className="text-white font-bold text-lg">{initials}</span>
    </div>
  );
};

// ─── Step indicator ───────────────────────────────────────────────────────────
const STEPS = [
  { key: 'provider', label: 'Provider', icon: '👤' },
  { key: 'datetime', label: 'Date & Time', icon: '📅' },
  { key: 'details',  label: 'Details',    icon: '📝' },
  { key: 'summary',  label: 'Confirm',    icon: '✅' },
];

const StepBar: React.FC<{ current: string }> = ({ current }) => {
  const idx = STEPS.findIndex(s => s.key === current);
  return (
    <div className="flex items-center mb-8">
      {STEPS.map((s, i) => (
        <React.Fragment key={s.key}>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              i < idx ? 'bg-green-500 text-white shadow-sm' :
              i === idx ? 'bg-blue-600 text-white shadow-md ring-4 ring-blue-100' :
              'bg-gray-100 text-gray-400'
            }`}>
              {i < idx ? '✓' : i + 1}
            </div>
            <span className={`mt-1.5 text-xs font-medium hidden sm:block ${i === idx ? 'text-blue-600' : i < idx ? 'text-green-600' : 'text-gray-400'}`}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${i < idx ? 'bg-green-400' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const BookConsultation: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedProviderId = searchParams.get('providerId');

  const [step, setStep] = useState<'provider' | 'datetime' | 'details' | 'summary'>(
    preSelectedProviderId ? 'datetime' : 'provider'
  );
  const [providers, setProviders] = useState<any[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [consultationType, setConsultationType] = useState<'video' | 'chat' | 'in-person'>('in-person');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [updatingSlots, setUpdatingSlots] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<any>(null);

  const calendarDays = Array.from({ length: 30 }, (_, i) => addDays(startOfDay(new Date()), i));

  useEffect(() => {
    if (!preSelectedProviderId) fetchProviders();
    else fetchProviderById(preSelectedProviderId);
  }, [preSelectedProviderId]);

  useEffect(() => {
    if (selectedProvider && selectedDate) {
      fetchTimeSlots();
      const poll = setInterval(() => fetchTimeSlots(true), 15000);
      return () => clearInterval(poll);
    }
  }, [selectedProvider, selectedDate]);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await servicesApi.getServices();
      const data = (res.data?.data as any)?.data ?? res.data?.data ?? res.data ?? [];
      setProviders(Array.isArray(data) ? data : []);
    } catch { showErrorToast('Failed to load providers'); }
    finally { setLoading(false); }
  };

  const fetchProviderById = async (id: string) => {
    setLoading(true);
    try {
      const res = await servicesApi.getServiceById(id);
      const raw = res.data?.data ?? res.data;
      setSelectedProvider({
        id: (raw as any).id || (raw as any)._id,
        name: (raw as any).provider?.name || (raw as any).title || 'Provider',
        specialty: (raw as any).provider?.specialty || (raw as any).category || '',
        photo: (raw as any).provider?.photo || null,
        rating: (raw as any).rating || 0,
        reviewCount: (raw as any).reviewCount || 0,
        price: (raw as any).price || 0,
        duration: (raw as any).duration || 30,
        description: (raw as any).description || '',
      });
    } catch { showErrorToast('Failed to load provider details'); }
    finally { setLoading(false); }
  };

  const fetchTimeSlots = async (silent = false) => {
    if (!selectedProvider || !selectedDate) return;
    if (!silent) setLoadingSlots(true); else setUpdatingSlots(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const res = await servicesApi.getAvailability(selectedProvider.id, dateStr);
      const newSlots = res.data?.data ?? res.data ?? [];
      if (selectedTimeSlot) {
        const still = newSlots.find((s: TimeSlot) => s.id === selectedTimeSlot.id && s.available);
        if (!still) { showWarningToast('Selected slot no longer available', { toastId: 'slot-unavailable' }); setSelectedTimeSlot(null); }
      }
      setTimeSlots(newSlots);
    } catch { if (!silent) { showErrorToast('Failed to load time slots'); setTimeSlots([]); } }
    finally { if (!silent) setLoadingSlots(false); else setUpdatingSlots(false); }
  };

  const handleConfirmBooking = async () => {
    if (!selectedProvider || !selectedTimeSlot || !selectedDate) return;
    setLoading(true);
    try {
      const res = await appointmentsApi.createAppointment({
        providerId: selectedProvider.id,
        timeSlotId: selectedTimeSlot.id,
        scheduledDate: selectedDate.toISOString(),
        scheduledTime: selectedTimeSlot.startTime,
        consultationType, reason, notes,
      });
      const appt = (res.data?.data as any) ?? res.data;
      setConfirmedAppointment(appt);
      showSuccessToast('Booking confirmed!');
      const fee = (appt as any)?.payment?.amount || selectedProvider.price || 0;
      if (fee > 0) setShowPaymentModal(true);
      else setTimeout(() => navigate('/patient/appointments'), 1500);
    } catch (err: any) {
      if (err.response?.status === 403) {
        showErrorToast('Subscription required. Redirecting...', { autoClose: 3000 });
        setTimeout(() => navigate('/patient/subscription'), 2000);
      } else if (err.response?.status === 409) {
        showErrorToast('Slot just booked. Please pick another time.');
        fetchTimeSlots(); setSelectedTimeSlot(null); setStep('datetime');
      } else {
        showErrorToast(err.response?.data?.message || 'Booking failed. Please try again.');
      }
    } finally { setLoading(false); }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Book a Consultation</h1>
          <p className="text-sm text-gray-500 mt-1">Schedule an appointment with a healthcare professional</p>
        </div>

        <StepBar current={step} />

        {/* ── Step 1: Provider ── */}
        {step === 'provider' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Choose a Provider</h2>
            {loading ? (
              <div className="flex flex-col items-center py-16 gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
                <p className="text-sm text-gray-500">Loading providers...</p>
              </div>
            ) : providers.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-3">🏥</div>
                <p className="text-gray-500">No providers available at the moment</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {providers.map((p: any) => {
                  const name = p.name || p.provider?.name || p.title || 'Provider';
                  const specialty = p.specialty || p.provider?.specialty || p.category || '';
                  const photo = p.photo || p.provider?.photo || null;
                  const price = p.price || 0;
                  const pid = p.id || p._id;
                  return (
                    <button key={pid} type="button"
                      onClick={() => { setSelectedProvider({ ...p, id: pid, name, specialty, photo, price }); setStep('datetime'); }}
                      className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group">
                      <Avatar name={name} photo={photo} />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 group-hover:text-blue-700 truncate">{name}</p>
                        <p className="text-xs text-gray-500 capitalize mt-0.5 truncate">{specialty}</p>
                        {price > 0 && (
                          <p className="text-sm font-bold text-blue-600 mt-1">₦{price.toLocaleString()}</p>
                        )}
                      </div>
                      <svg className="w-5 h-5 text-gray-300 group-hover:text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Step 2: Date & Time ── */}
        {step === 'datetime' && selectedProvider && (
          <div className="space-y-4">
            {/* Provider card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={selectedProvider.name} photo={selectedProvider.photo} size="w-12 h-12" />
                <div>
                  <p className="font-bold text-gray-900">{selectedProvider.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{selectedProvider.specialty}</p>
                </div>
              </div>
              <button onClick={() => setStep('provider')}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                Change
              </button>
            </div>

            {/* Calendar */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Select a Date</h3>
              <div className="overflow-x-auto pb-1">
                <div className="flex gap-2 min-w-max">
                  {calendarDays.map(day => {
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isPast = day < startOfDay(new Date());
                    return (
                      <button key={day.toISOString()} type="button"
                        onClick={() => !isPast && setSelectedDate(day)}
                        disabled={isPast}
                        className={`flex flex-col items-center w-14 py-3 rounded-xl transition-all ${
                          isSelected ? 'bg-blue-600 text-white shadow-md' :
                          isPast ? 'bg-gray-50 text-gray-300 cursor-not-allowed' :
                          'bg-gray-50 hover:bg-blue-50 hover:border-blue-300 border border-transparent text-gray-700'
                        }`}>
                        <span className="text-xs font-medium">{format(day, 'EEE')}</span>
                        <span className="text-lg font-bold mt-0.5">{format(day, 'd')}</span>
                        <span className="text-xs">{format(day, 'MMM')}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Available Times</h3>
                  {updatingSlots && (
                    <span className="text-xs text-blue-600 flex items-center gap-1">
                      <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Refreshing...
                    </span>
                  )}
                </div>
                {loadingSlots ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                  </div>
                ) : timeSlots.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-3xl mb-2">🕐</div>
                    <p className="text-sm">No available slots for this date</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {timeSlots.map(slot => (
                      <button key={slot.id} type="button"
                        onClick={() => slot.available && setSelectedTimeSlot(slot)}
                        disabled={!slot.available}
                        className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          selectedTimeSlot?.id === slot.id
                            ? 'bg-blue-600 text-white shadow-md'
                            : slot.available
                            ? 'bg-gray-50 border border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                            : 'bg-gray-100 text-gray-300 cursor-not-allowed line-through'
                        }`}>
                        {slot.startTime}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <button type="button" onClick={() => { if (!selectedTimeSlot) { showErrorToast('Please select a time slot'); return; } setStep('details'); }}
                disabled={!selectedTimeSlot}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors">
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Details ── */}
        {step === 'details' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Consultation Details</h2>
              <button onClick={() => setStep('datetime')} className="text-sm text-blue-600 hover:text-blue-700 font-medium">← Back</button>
            </div>

            {/* Consultation type */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">How would you like to consult?</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'video',      label: 'Video Call', icon: '📹', desc: 'Face-to-face online' },
                  { value: 'chat',       label: 'Phone',      icon: '📞', desc: 'Voice call' },
                  { value: 'in-person',  label: 'In-Person',  icon: '🏥', desc: 'Visit the clinic' },
                ].map(t => (
                  <button key={t.value} type="button" onClick={() => setConsultationType(t.value as any)}
                    className={`p-4 rounded-2xl border-2 text-center transition-all ${
                      consultationType === t.value
                        ? 'border-blue-600 bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}>
                    <div className="text-2xl mb-1">{t.icon}</div>
                    <div className="text-sm font-bold text-gray-900">{t.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Reason for Visit <span className="text-red-500">*</span>
              </label>
              <input type="text" value={reason} onChange={e => setReason(e.target.value)}
                placeholder="e.g., Annual checkup, Flu symptoms, Follow-up..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Additional Notes <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                placeholder="Any symptoms, medications, or information you'd like to share..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none" />
            </div>

            <div className="flex justify-end">
              <button type="button" onClick={() => { if (!reason.trim()) { showErrorToast('Please provide a reason for your visit'); return; } setStep('summary'); }}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                Review Booking →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Summary ── */}
        {step === 'summary' && selectedProvider && selectedDate && selectedTimeSlot && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Booking Summary</h2>
                  <p className="text-blue-100 text-sm mt-0.5">Review your appointment details</p>
                </div>
                <button onClick={() => setStep('details')} className="text-blue-200 hover:text-white text-sm font-medium">Edit</button>
              </div>

              <div className="p-6 space-y-5">
                {/* Provider */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                  <Avatar name={selectedProvider.name} photo={selectedProvider.photo} size="w-14 h-14" />
                  <div>
                    <p className="font-bold text-gray-900">{selectedProvider.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{selectedProvider.specialty}</p>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: '📅', label: 'Date', value: format(selectedDate, 'EEEE, MMM d, yyyy') },
                    { icon: '🕐', label: 'Time', value: `${selectedTimeSlot.startTime}${selectedTimeSlot.endTime ? ` – ${selectedTimeSlot.endTime}` : ''}` },
                    { icon: consultationType === 'video' ? '📹' : consultationType === 'chat' ? '📞' : '🏥',
                      label: 'Mode',
                      value: consultationType === 'video' ? 'Video Call' : consultationType === 'chat' ? 'Phone Call' : 'In-Person' },
                    { icon: '💬', label: 'Reason', value: reason },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">{icon} {label}</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{value}</p>
                    </div>
                  ))}
                </div>

                {notes && (
                  <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <p className="text-xs text-blue-600 font-medium mb-1">📋 Notes</p>
                    <p className="text-sm text-gray-700">{notes}</p>
                  </div>
                )}

                {/* Price */}
                {selectedProvider.price > 0 && (
                  <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Consultation Fee</p>
                      <p className="text-xs text-gray-500 mt-0.5">Secured via Paystack</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">₦{selectedProvider.price.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button type="button" onClick={() => navigate('/patient/browse-services')} disabled={loading}
                className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors">
                Cancel
              </button>
              <button type="button" onClick={handleConfirmBooking} disabled={loading}
                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-sm">
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </>
                ) : selectedProvider.price > 0 ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Confirm & Pay ₦{selectedProvider.price.toLocaleString()}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Confirm Booking
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedProvider && confirmedAppointment && (
          <PaymentModal
            isOpen={showPaymentModal}
            amount={(confirmedAppointment as any)?.payment?.amount || selectedProvider.price || 0}
            service={`Consultation with ${selectedProvider.name}`}
            appointmentId={(confirmedAppointment as any).id || (confirmedAppointment as any)._id}
            onClose={() => {
              setShowPaymentModal(false);
              showInfoToast('You can complete payment later from the Payments page.');
              setTimeout(() => navigate('/patient/appointments'), 2000);
            }}
            onSuccess={(ref: string) => {
              setShowPaymentModal(false);
              showSuccessToast('Payment successful!');
              setTimeout(() => navigate('/patient/appointments'), 1500);
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default BookConsultation;
