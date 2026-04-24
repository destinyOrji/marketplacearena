import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout, PaymentModal } from '../components';
import { servicesApi, appointmentsApi } from '../services/api';
import { ServiceProvider, TimeSlot } from '../types';
import { showSuccessToast, showErrorToast, showWarningToast, showInfoToast } from '../utils/toast';
import { format, addDays, startOfDay, isSameDay, parseISO } from 'date-fns';

const BookConsultation: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedProviderId = searchParams.get('providerId');

  // State management
  const [step, setStep] = useState<'provider' | 'datetime' | 'details' | 'summary'>(
    preSelectedProviderId ? 'datetime' : 'provider'
  );
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [consultationType, setConsultationType] = useState<'video' | 'chat' | 'in-person'>('video');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [updatingSlots, setUpdatingSlots] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<any>(null);

  // Generate next 30 days for calendar
  const generateCalendarDays = () => {
    const days = [];
    for (let i = 0; i < 30; i++) {
      days.push(addDays(startOfDay(new Date()), i));
    }
    return days;
  };

  const calendarDays = generateCalendarDays();

  // Fetch providers if not pre-selected
  useEffect(() => {
    if (!preSelectedProviderId) {
      fetchProviders();
    } else {
      fetchProviderById(preSelectedProviderId);
    }
  }, [preSelectedProviderId]);

  // Fetch time slots when date is selected
  useEffect(() => {
    if (selectedProvider && selectedDate) {
      fetchTimeSlots();
      
      // Set up polling for real-time updates every 15 seconds (silent mode)
      const pollInterval = setInterval(() => {
        fetchTimeSlots(true); // Silent polling to avoid loading spinner
      }, 15000);
      
      return () => clearInterval(pollInterval);
    }
  }, [selectedProvider, selectedDate]);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const response = await servicesApi.getServices({ type: ['doctor', 'hospital'] });
      const providersData = response.data?.data ?? response.data ?? [];
      setProviders(Array.isArray(providersData) ? providersData : []);
    } catch (error) {
      showErrorToast('Failed to load providers');
    } finally {
      setLoading(false);
    }
  };

  const fetchProviderById = async (id: string) => {
    setLoading(true);
    try {
      const response = await servicesApi.getServiceById(id);
      setSelectedProvider(response.data?.data ?? response.data);
    } catch (error) {
      showErrorToast('Failed to load provider details');
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeSlots = async (silent: boolean = false) => {
    if (!selectedProvider || !selectedDate) return;

    if (!silent) {
      setLoadingSlots(true);
    } else {
      setUpdatingSlots(true);
    }
    
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await servicesApi.getAvailability(selectedProvider.id, dateStr);
      const newSlots = response.data?.data ?? response.data ?? [];
      
      // Check if previously selected slot is still available
      if (selectedTimeSlot) {
        const stillAvailable = newSlots.find(
          (slot: TimeSlot) => slot.id === selectedTimeSlot.id && slot.available
        );
        
        if (!stillAvailable) {
          showWarningToast('Your selected time slot is no longer available. Please select another.', {
            toastId: 'slot-unavailable', // Prevent duplicate toasts
          });
          setSelectedTimeSlot(null);
        }
      }
      
      setTimeSlots(newSlots);
    } catch (error) {
      if (!silent) {
        showErrorToast('Failed to load available time slots');
      }
      setTimeSlots([]);
    } finally {
      if (!silent) {
        setLoadingSlots(false);
      } else {
        setUpdatingSlots(false);
      }
    }
  };

  const handleProviderSelect = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setStep('datetime');
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
  };

  const handleTimeSlotSelect = (slot: TimeSlot) => {
    if (slot.available) {
      setSelectedTimeSlot(slot);
    }
  };

  const handleContinueToDetails = () => {
    if (!selectedTimeSlot) {
      showErrorToast('Please select a time slot');
      return;
    }
    setStep('details');
  };

  const handleContinueToSummary = () => {
    if (!reason.trim()) {
      showErrorToast('Please provide a reason for your visit');
      return;
    }
    setStep('summary');
  };

  const handleConfirmBooking = async () => {
    if (!selectedProvider || !selectedTimeSlot || !selectedDate) {
      showErrorToast('Missing booking information');
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        providerId: selectedProvider.id,
        timeSlotId: selectedTimeSlot.id,
        consultationType,
        reason,
        notes,
      };

      const response = await appointmentsApi.createAppointment(bookingData);
      const appointmentData = response.data?.data ?? response.data;
      
      setConfirmedAppointment(appointmentData);
      showSuccessToast('Booking confirmed! Confirmation sent via email and SMS.');
      
      // Check if payment is required
      if (selectedProvider.price && selectedProvider.price > 0) {
        // Show payment modal
        setShowPaymentModal(true);
      } else {
        // Free consultation, go directly to appointments
        setTimeout(() => {
          navigate('/patient/appointments');
        }, 1500);
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      
      // Handle concurrent booking conflict
      if (error.response?.status === 409 || error.response?.data?.code === 'SLOT_UNAVAILABLE') {
        showErrorToast('This time slot was just booked by another patient. Please select a different time.', {
          autoClose: 5000,
        });
        // Refresh time slots immediately
        fetchTimeSlots();
        setSelectedTimeSlot(null);
        setStep('datetime');
      } else {
        const errorMessage = error.response?.data?.message || 'Failed to create booking. Please try again.';
        showErrorToast(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentId: string) => {
    setShowPaymentModal(false);
    showSuccessToast('Payment completed successfully!');
    setTimeout(() => {
      navigate('/patient/appointments');
    }, 1500);
  };

  const handlePaymentClose = () => {
    setShowPaymentModal(false);
    // Still navigate to appointments even if payment modal is closed
    // The appointment is already created
    showInfoToast('You can complete payment later from the Payments page.');
    setTimeout(() => {
      navigate('/patient/appointments');
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Book Consultation</h1>
          <p className="text-gray-600 mt-2">Schedule an appointment with a healthcare professional</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {[
              { key: 'provider', label: 'Provider' },
              { key: 'datetime', label: 'Date & Time' },
              { key: 'details', label: 'Details' },
              { key: 'summary', label: 'Summary' },
            ].map((s, index) => (
              <div key={s.key} className="flex items-center flex-1 min-w-0">
                <div className="flex items-center flex-shrink-0">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                      step === s.key
                        ? 'bg-blue-600 text-white'
                        : index < ['provider', 'datetime', 'details', 'summary'].indexOf(step)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium text-gray-700 hidden sm:block">{s.label}</span>
                </div>
                {index < 3 && <div className="flex-1 h-1 bg-gray-200 mx-1 sm:mx-4" />}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-md p-6">
          {/* Step 1: Provider Selection */}
          {step === 'provider' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Select a Healthcare Provider</h2>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading providers...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {providers.map((provider) => (
                    <div
                      key={provider.id}
                      onClick={() => handleProviderSelect(provider)}
                      className="border rounded-lg p-4 cursor-pointer hover:border-blue-600 hover:shadow-lg transition-all"
                    >
                      <img
                        src={provider.photo || '/placeholder-doctor.png'}
                        alt={provider.name}
                        className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
                      />
                      <h3 className="font-semibold text-center">{provider.name}</h3>
                      <p className="text-sm text-gray-600 text-center">{provider.specialty}</p>
                      <div className="flex items-center justify-center mt-2">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm ml-1">
                          {provider.rating} ({provider.reviewCount})
                        </span>
                      </div>
                      {provider.price && (
                        <p className="text-center text-blue-600 font-semibold mt-2">
                          ${provider.price}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Date & Time Selection */}
          {step === 'datetime' && selectedProvider && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Select Date & Time</h2>
                <button
                  onClick={() => setStep('provider')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Change Provider
                </button>
              </div>

              {/* Selected Provider Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 flex items-center">
                <img
                  src={selectedProvider.photo || '/placeholder-doctor.png'}
                  alt={selectedProvider.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="ml-4">
                  <h3 className="font-semibold">{selectedProvider.name}</h3>
                  <p className="text-sm text-gray-600">{selectedProvider.specialty}</p>
                </div>
              </div>

              {/* Calendar */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Select Date</h3>
                <div className="overflow-x-auto pb-2">
                  <div className="grid grid-cols-7 gap-1 sm:gap-2 min-w-[320px]">
                    {calendarDays.map((day) => {
                      const isSelected = selectedDate && isSameDay(day, selectedDate);
                      const isPast = day < startOfDay(new Date());
                      return (
                        <button
                          key={day.toISOString()}
                          onClick={() => !isPast && handleDateSelect(day)}
                          disabled={isPast}
                          className={`p-1 sm:p-3 rounded-lg text-center ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : isPast
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-gray-50 hover:bg-blue-50 text-gray-900'
                          }`}
                        >
                          <div className="text-xs">{format(day, 'EEE')}</div>
                          <div className="text-sm sm:text-lg font-semibold">{format(day, 'd')}</div>
                          <div className="text-xs hidden sm:block">{format(day, 'MMM')}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">Select Time Slot</h3>
                    {updatingSlots && (
                      <span className="text-sm text-blue-600 flex items-center">
                        <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating availability...
                      </span>
                    )}
                  </div>
                  {loadingSlots ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Loading available slots...</p>
                    </div>
                  ) : timeSlots.length === 0 ? (
                    <p className="text-center text-gray-600 py-8">
                      No available time slots for this date
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => handleTimeSlotSelect(slot)}
                          disabled={!slot.available}
                          className={`p-3 rounded-lg text-sm font-medium transition-all ${
                            selectedTimeSlot?.id === slot.id
                              ? 'bg-blue-600 text-white'
                              : slot.available
                              ? 'bg-gray-50 hover:bg-blue-50 text-gray-900'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {slot.startTime}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleContinueToDetails}
                  disabled={!selectedTimeSlot}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Consultation Details */}
          {step === 'details' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Consultation Details</h2>
                <button
                  onClick={() => setStep('datetime')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Back
                </button>
              </div>

              {/* Consultation Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Consultation Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { value: 'video', label: 'Video Call', icon: '📹' },
                    { value: 'chat', label: 'Chat', icon: '💬' },
                    { value: 'in-person', label: 'In-Person', icon: '🏥' },
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setConsultationType(type.value as any)}
                      className={`p-4 rounded-lg border-2 text-center ${
                        consultationType === type.value
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">{type.icon}</div>
                      <div className="font-medium">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason for Visit */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Visit <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Annual checkup, Flu symptoms, Follow-up"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              {/* Additional Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional information you'd like to share..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleContinueToSummary}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Continue to Summary
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Booking Summary */}
          {step === 'summary' && selectedProvider && selectedDate && selectedTimeSlot && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Booking Summary</h2>
                <button
                  onClick={() => setStep('details')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Edit
                </button>
              </div>

              <div className="space-y-6">
                {/* Provider Info */}
                <div className="border-b pb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Healthcare Provider</h3>
                  <div className="flex items-center">
                    <img
                      src={selectedProvider.photo || '/placeholder-doctor.png'}
                      alt={selectedProvider.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="ml-4">
                      <p className="font-semibold">{selectedProvider.name}</p>
                      <p className="text-sm text-gray-600">{selectedProvider.specialty}</p>
                    </div>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="border-b pb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Date & Time</h3>
                  <p className="font-semibold">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
                  <p className="text-gray-600">
                    {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}
                  </p>
                </div>

                {/* Consultation Type */}
                <div className="border-b pb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Consultation Type</h3>
                  <p className="font-semibold capitalize">{consultationType.replace('-', ' ')}</p>
                </div>

                {/* Reason */}
                <div className="border-b pb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Reason for Visit</h3>
                  <p className="text-gray-900">{reason}</p>
                </div>

                {/* Notes */}
                {notes && (
                  <div className="border-b pb-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Additional Notes</h3>
                    <p className="text-gray-900">{notes}</p>
                  </div>
                )}

                {/* Price */}
                {selectedProvider.price && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium">Total Amount</span>
                      <span className="text-2xl font-bold text-blue-600">
                        ${selectedProvider.price}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end space-x-4">
                <button
                  onClick={() => navigate('/patient/browse-services')}
                  disabled={loading}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBooking}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : selectedProvider.price && selectedProvider.price > 0 ? (
                    'Confirm & Pay'
                  ) : (
                    'Confirm Booking'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Payment Modal */}
        {showPaymentModal && selectedProvider && confirmedAppointment && (
          <PaymentModal
            isOpen={showPaymentModal}
            amount={selectedProvider.price || 0}
            service={`Consultation with ${selectedProvider.name}`}
            appointmentId={confirmedAppointment.id}
            onClose={handlePaymentClose}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default BookConsultation;
