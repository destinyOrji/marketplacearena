import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components';
import { emergencyApi } from '../services/api';
import { AmbulanceService, EmergencyBooking } from '../types';
import { showSuccessToast, showErrorToast, showWarningToast } from '../utils/toast';

interface Location { latitude: number; longitude: number; address: string; }
interface BookingConfirmation {
  id: string; ambulance: AmbulanceService; estimatedArrival: number;
  driverName: string; driverPhone: string; vehicleNumber: string;
}

const EMERGENCY_TYPES = [
  { label: 'Cardiac Emergency', icon: '❤️' },
  { label: 'Accident / Trauma', icon: '🚗' },
  { label: 'Respiratory Distress', icon: '🫁' },
  { label: 'Stroke', icon: '🧠' },
  { label: 'Severe Bleeding', icon: '🩸' },
  { label: 'Unconscious Patient', icon: '😴' },
  { label: 'Other Medical Emergency', icon: '🏥' },
];

const EmergencyServices: React.FC = () => {
  const [step, setStep] = useState<'form' | 'search' | 'tracking'>('form');
  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [patientLocation, setPatientLocation] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [destinationInput, setDestinationInput] = useState('');
  const [emergencyType, setEmergencyType] = useState('');
  const [patientCondition, setPatientCondition] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [availableAmbulances, setAvailableAmbulances] = useState<AmbulanceService[]>([]);
  const [selectedAmbulance, setSelectedAmbulance] = useState<AmbulanceService | null>(null);
  const [bookingConfirmation, setBookingConfirmation] = useState<BookingConfirmation | null>(null);

  useEffect(() => { detectCurrentLocation(); }, []);

  const detectCurrentLocation = () => {
    setDetectingLocation(true);
    if (!('geolocation' in navigator)) {
      setDetectingLocation(false);
      showErrorToast('Geolocation not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const addr = data.address || {};
          const parts = [addr.road || addr.street, addr.suburb || addr.neighbourhood, addr.city || addr.town || addr.village, addr.state].filter(Boolean);
          const readableAddress = parts.length > 0 ? parts.join(', ') : data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setPatientLocation({ latitude, longitude, address: readableAddress });
          showSuccessToast('Location detected');
        } catch {
          setPatientLocation({ latitude, longitude, address: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}` });
        }
        setDetectingLocation(false);
      },
      () => { setDetectingLocation(false); showErrorToast('Failed to detect location. Please enter manually.'); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSearchAmbulances = async () => {
    if (!patientLocation) { showErrorToast('Please allow location access or enter your location'); return; }
    if (!emergencyType) { showErrorToast('Please select an emergency type'); return; }
    if (!patientCondition.trim()) { showErrorToast('Please describe the patient condition'); return; }
    if (!contactNumber.trim()) { showErrorToast('Please provide a contact number'); return; }
    setLoading(true);
    try {
      const res = await emergencyApi.getAmbulances({ latitude: patientLocation.latitude, longitude: patientLocation.longitude, radius: 10 });
      const data = res.data?.data ?? res.data ?? [];
      setAvailableAmbulances(Array.isArray(data) ? data : []);
      setStep('search');
      if (!data.length) showWarningToast('No ambulances within 10km. Showing all available.');
    } catch (err: any) { showErrorToast(err.message || 'Failed to search for ambulances'); }
    finally { setLoading(false); }
  };

  const handleBookAmbulance = async (ambulance: AmbulanceService) => {
    if (!patientLocation) return;
    setLoading(true); setSelectedAmbulance(ambulance);
    try {
      const res = await emergencyApi.bookAmbulance({
        patientLocation, destination: destination || patientLocation,
        emergencyType, patientCondition, contactNumber, ambulanceId: ambulance.id,
      });
      setBookingConfirmation(res.data?.data ?? res.data);
      setStep('tracking');
      showSuccessToast('Ambulance booked! Help is on the way.');
    } catch (err: any) { showErrorToast(err.message || 'Failed to book ambulance'); setSelectedAmbulance(null); }
    finally { setLoading(false); }
  };

  // ── Step 1: Form ──────────────────────────────────────────────────────────
  if (step === 'form') return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Hero */}
        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-6 text-white text-center">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🚑</span>
          </div>
          <h1 className="text-2xl font-bold">Emergency Ambulance</h1>
          <p className="text-red-100 text-sm mt-1">Get immediate medical transportation assistance</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              📍 Your Current Location <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input type="text"
                value={patientLocation?.address || ''}
                onChange={e => setPatientLocation(prev => prev ? { ...prev, address: e.target.value } : { latitude: 0, longitude: 0, address: e.target.value })}
                placeholder={detectingLocation ? 'Detecting location...' : 'Enter or detect your location'}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500" />
              <button onClick={detectCurrentLocation} disabled={detectingLocation}
                className="px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:bg-gray-300 transition-colors flex items-center gap-2 text-sm font-semibold flex-shrink-0">
                {detectingLocation ? (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
                {detectingLocation ? 'Detecting...' : 'Detect'}
              </button>
            </div>
          </div>

          {/* Destination */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              🏥 Destination Hospital <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input type="text" value={destinationInput}
              onChange={e => { setDestinationInput(e.target.value); if (e.target.value.length > 3) setDestination({ latitude: 0, longitude: 0, address: e.target.value }); }}
              placeholder="Enter hospital or destination address"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500" />
          </div>

          {/* Emergency Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              ⚠️ Emergency Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {EMERGENCY_TYPES.map(t => (
                <button key={t.label} type="button" onClick={() => setEmergencyType(t.label)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all text-left ${
                    emergencyType === t.label
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 text-gray-700 hover:border-red-300 hover:bg-red-50'
                  }`}>
                  <span className="text-base">{t.icon}</span>
                  <span className="truncate">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Patient Condition */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              🩺 Patient Condition <span className="text-red-500">*</span>
            </label>
            <textarea value={patientCondition} onChange={e => setPatientCondition(e.target.value)} rows={3}
              placeholder="Describe symptoms, consciousness level, any visible injuries..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none" />
            <p className="text-xs text-gray-400 mt-1">This helps paramedics prepare the right equipment</p>
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              📞 Contact Number <span className="text-red-500">*</span>
            </label>
            <input type="tel" value={contactNumber} onChange={e => setContactNumber(e.target.value)}
              placeholder="+234..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500" />
          </div>

          {/* Submit */}
          <button onClick={handleSearchAmbulances} disabled={loading}
            className="w-full py-4 bg-red-600 text-white font-bold text-base rounded-xl hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-3 shadow-sm">
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Searching for ambulances...
              </>
            ) : (
              <>
                <span className="text-xl">🚑</span>
                Find Available Ambulances
              </>
            )}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );

  // ── Step 2: Search Results ────────────────────────────────────────────────
  if (step === 'search') return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Available Ambulances</h2>
            <p className="text-sm text-gray-500 mt-0.5">{availableAmbulances.length} found near your location</p>
          </div>
          <button onClick={() => setStep('form')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
            ← Back
          </button>
        </div>

        {availableAmbulances.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
            <div className="text-5xl mb-4">🚑</div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No ambulances available nearby</h3>
            <p className="text-sm text-gray-500 mb-5">Please try again or call emergency services directly</p>
            <a href="tel:112" className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors">
              📞 Call 112
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {availableAmbulances.map((amb: any) => (
              <div key={amb.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-red-300 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center flex-shrink-0 border border-red-100">
                    <span className="text-3xl">🚑</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="font-bold text-gray-900">{amb.serviceName || 'Emergency Service'}</p>
                        <p className="text-xs text-gray-500 capitalize mt-0.5">{amb.serviceType || 'Basic Life Support'}</p>
                      </div>
                      {amb.isAvailable && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          Available
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2.5">
                      {amb.averageResponseTime > 0 && (
                        <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full">
                          ⏱ ~{amb.averageResponseTime} min response
                        </span>
                      )}
                      {amb.averageRating > 0 && (
                        <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-100 px-2.5 py-1 rounded-full">
                          ⭐ {amb.averageRating.toFixed(1)} ({amb.totalReviews || 0})
                        </span>
                      )}
                      {amb.activeVehicles > 0 && (
                        <span className="text-xs bg-gray-50 text-gray-600 border border-gray-200 px-2.5 py-1 rounded-full">
                          🚑 {amb.activeVehicles} vehicle{amb.activeVehicles !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {amb.services?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {amb.services.slice(0, 2).map((s: any) => (
                          <span key={s.id} className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-200">
                            {s.name} {s.basePrice > 0 ? `· ₦${s.basePrice.toLocaleString()}` : ''}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      {amb.emergencyNumber && (
                        <a href={`tel:${amb.emergencyNumber}`}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-white text-blue-600 text-xs font-semibold rounded-xl border border-blue-200 hover:bg-blue-50 transition-colors">
                          📞 Call
                        </a>
                      )}
                      <button onClick={() => handleBookAmbulance(amb)} disabled={loading}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm">
                        {loading && selectedAmbulance?.id === amb.id ? (
                          <>
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Booking...
                          </>
                        ) : (
                          <> 🚑 Book This Ambulance </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );

  // ── Step 3: Tracking ──────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Success banner */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white text-center">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold">Ambulance Booked!</h2>
          <p className="text-green-100 text-sm mt-1">Help is on the way. Stay calm and keep your phone nearby.</p>
        </div>

        {bookingConfirmation && (
          <>
            {/* ETA */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Estimated Arrival</p>
                  <p className="text-4xl font-bold text-blue-600 mt-1">{bookingConfirmation.estimatedArrival} <span className="text-xl text-gray-500">min</span></p>
                </div>
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <span className="text-3xl">⏱</span>
                </div>
              </div>
              {/* Pulse animation */}
              <div className="mt-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-green-600 font-medium">Ambulance dispatched and en route</span>
              </div>
            </div>

            {/* Ambulance + Driver */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">🚑 Ambulance</p>
                <div className="space-y-2 text-sm">
                  <div><p className="text-gray-400 text-xs">Provider</p><p className="font-semibold text-gray-900">{(bookingConfirmation.ambulance as any)?.serviceName || 'Emergency Service'}</p></div>
                  <div><p className="text-gray-400 text-xs">Vehicle</p><p className="font-semibold text-gray-900">{bookingConfirmation.vehicleNumber || 'TBD'}</p></div>
                  {(bookingConfirmation.ambulance as any)?.averageRating > 0 && (
                    <div><p className="text-gray-400 text-xs">Rating</p><p className="font-semibold text-gray-900">⭐ {(bookingConfirmation.ambulance as any).averageRating.toFixed(1)}</p></div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">👤 Driver</p>
                <div className="space-y-2 text-sm">
                  <div><p className="text-gray-400 text-xs">Name</p><p className="font-semibold text-gray-900">{bookingConfirmation.driverName}</p></div>
                  <div><p className="text-gray-400 text-xs">Phone</p><p className="font-semibold text-gray-900">{bookingConfirmation.driverPhone}</p></div>
                </div>
                <a href={`tel:${bookingConfirmation.driverPhone}`}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                  📞 Call Driver
                </a>
              </div>
            </div>

            {/* Emergency details */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">📋 Emergency Details</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-gray-400 text-xs">Type</p><p className="font-semibold text-gray-900">{emergencyType}</p></div>
                <div><p className="text-gray-400 text-xs">Contact</p><p className="font-semibold text-gray-900">{contactNumber}</p></div>
                <div className="col-span-2"><p className="text-gray-400 text-xs">Condition</p><p className="font-semibold text-gray-900">{patientCondition}</p></div>
                <div className="col-span-2"><p className="text-gray-400 text-xs">Pickup</p><p className="font-semibold text-gray-900">{patientLocation?.address}</p></div>
                {destination && <div className="col-span-2"><p className="text-gray-400 text-xs">Destination</p><p className="font-semibold text-gray-900">{destination.address}</p></div>}
              </div>
            </div>

            {/* Booking ID */}
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 text-center">
              <p className="text-xs text-gray-500">Booking Reference</p>
              <p className="font-mono font-bold text-gray-900 text-lg mt-1">{bookingConfirmation.id}</p>
              <p className="text-xs text-gray-400 mt-1">Save this for your records</p>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EmergencyServices;
