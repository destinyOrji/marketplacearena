import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components';
import { emergencyApi } from '../services/api';
import { AmbulanceService, EmergencyBooking } from '../types';
import { showSuccessToast, showErrorToast, showWarningToast } from '../utils/toast';

interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

interface BookingConfirmation {
  id: string;
  ambulance: AmbulanceService;
  estimatedArrival: number;
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
}

const EmergencyServices: React.FC = () => {
  const [step, setStep] = useState<'form' | 'search' | 'tracking'>('form');
  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  
  // Form state
  const [patientLocation, setPatientLocation] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [destinationInput, setDestinationInput] = useState('');
  const [emergencyType, setEmergencyType] = useState('');
  const [patientCondition, setPatientCondition] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  
  // Search results
  const [availableAmbulances, setAvailableAmbulances] = useState<AmbulanceService[]>([]);
  const [selectedAmbulance, setSelectedAmbulance] = useState<AmbulanceService | null>(null);
  
  // Booking confirmation
  const [bookingConfirmation, setBookingConfirmation] = useState<BookingConfirmation | null>(null);

  const emergencyTypes = [
    'Cardiac Emergency',
    'Accident/Trauma',
    'Respiratory Distress',
    'Stroke',
    'Severe Bleeding',
    'Unconscious Patient',
    'Other Medical Emergency',
  ];

  useEffect(() => {
    // Auto-detect location on component mount
    detectCurrentLocation();
  }, []);

  const detectCurrentLocation = () => {
    setDetectingLocation(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Use OpenStreetMap Nominatim for reverse geocoding (free, no API key)
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
              { headers: { 'Accept-Language': 'en' } }
            );
            const data = await response.json();
            
            // Build a readable address
            const addr = data.address || {};
            const parts = [
              addr.house_number,
              addr.road || addr.street,
              addr.suburb || addr.neighbourhood || addr.quarter,
              addr.city || addr.town || addr.village || addr.county,
              addr.state,
              addr.country,
            ].filter(Boolean);
            
            const readableAddress = parts.length > 0
              ? parts.join(', ')
              : data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

            // Also search for nearby bus stops using Overpass API
            const busStopQuery = `
              [out:json][timeout:10];
              (
                node["highway"="bus_stop"](around:500,${latitude},${longitude});
                node["public_transport"="stop_position"](around:500,${latitude},${longitude});
              );
              out body 3;
            `;
            let nearbyBusStop = '';
            try {
              const busRes = await fetch('https://overpass-api.de/api/interpreter', {
                method: 'POST',
                body: busStopQuery,
              });
              const busData = await busRes.json();
              if (busData.elements && busData.elements.length > 0) {
                const stop = busData.elements[0];
                nearbyBusStop = stop.tags?.name || stop.tags?.ref || '';
              }
            } catch {
              // Bus stop lookup failed silently
            }

            const fullAddress = nearbyBusStop
              ? `${readableAddress} (Near: ${nearbyBusStop})`
              : readableAddress;

            setPatientLocation({ latitude, longitude, address: fullAddress });
            showSuccessToast('Location detected successfully');
          } catch (err) {
            // Fallback to coordinates if geocoding fails
            setPatientLocation({
              latitude,
              longitude,
              address: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
            });
            showSuccessToast('Location detected (coordinates only)');
          }
          setDetectingLocation(false);
        },
        (error) => {
          console.error('Error detecting location:', error);
          setDetectingLocation(false);
          showErrorToast('Failed to detect location. Please enter manually.');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setDetectingLocation(false);
      showErrorToast('Geolocation is not supported by your browser');
    }
  };

  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDestinationInput(value);
    
    // In production, implement address autocomplete here
    // For now, we'll set a mock destination when user types
    if (value.length > 3) {
      setDestination({
        latitude: 0,
        longitude: 0,
        address: value,
      });
    }
  };

  const handleSearchAmbulances = async () => {
    if (!patientLocation) {
      showErrorToast('Please allow location access or enter your location');
      return;
    }
    
    if (!emergencyType) {
      showErrorToast('Please select an emergency type');
      return;
    }
    
    if (!patientCondition) {
      showErrorToast('Please describe the patient condition');
      return;
    }
    
    if (!contactNumber) {
      showErrorToast('Please provide a contact number');
      return;
    }

    try {
      setLoading(true);
      
      const response = await emergencyApi.getAmbulances({
        latitude: patientLocation.latitude,
        longitude: patientLocation.longitude,
        radius: 10, // 10km radius
      });
      
      const ambulancesData = response.data?.data ?? response.data ?? [];
      setAvailableAmbulances(Array.isArray(ambulancesData) ? ambulancesData : []);
      setStep('search');
      
      if (ambulancesData.length === 0) {
        showWarningToast('No ambulances available within 10km. Expanding search...');
      }
    } catch (error: any) {
      console.error('Error fetching ambulances:', error);
      showErrorToast(error.message || 'Failed to search for ambulances');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAmbulance = async (ambulance: AmbulanceService) => {
    if (!patientLocation) return;
    
    try {
      setLoading(true);
      setSelectedAmbulance(ambulance);
      
      const bookingData: EmergencyBooking = {
        patientLocation,
        destination: destination || patientLocation,
        emergencyType,
        patientCondition,
        contactNumber,
      };
      
      const response = await emergencyApi.bookAmbulance({
        ...bookingData,
        ambulanceId: ambulance.id,
      });
      
      const confirmationData = response.data?.data ?? response.data;
      setBookingConfirmation(confirmationData);
      setStep('tracking');
      showSuccessToast('Ambulance booked successfully!');
    } catch (error: any) {
      console.error('Error booking ambulance:', error);
      showErrorToast(error.message || 'Failed to book ambulance');
      setSelectedAmbulance(null);
    } finally {
      setLoading(false);
    }
  };

  const renderFormStep = () => (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Emergency Ambulance Service</h1>
          <p className="text-gray-600 mt-2">
            Get immediate medical transportation assistance
          </p>
        </div>

        <div className="space-y-6">
          {/* Current Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Location *
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={patientLocation?.address || ''}
                onChange={(e) => setPatientLocation(prev => prev ? { ...prev, address: e.target.value } : null)}
                placeholder="Detecting your location..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={detectCurrentLocation}
                disabled={detectingLocation}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {detectingLocation ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Detecting...</span>
                  </>
                ) : (
                  <>
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
                    <span>Detect</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              We'll use your current location to find nearby ambulances
            </p>
          </div>

          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination (Optional)
            </label>
            <input
              type="text"
              value={destinationInput}
              onChange={handleDestinationChange}
              placeholder="Enter hospital or destination address"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave blank if you need immediate assistance at current location
            </p>
          </div>

          {/* Emergency Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emergency Type *
            </label>
            <select
              value={emergencyType}
              onChange={(e) => setEmergencyType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select emergency type</option>
              {emergencyTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Patient Condition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Patient Condition *
            </label>
            <textarea
              value={patientCondition}
              onChange={(e) => setPatientCondition(e.target.value)}
              placeholder="Briefly describe the patient's condition and symptoms"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              This helps paramedics prepare for the emergency
            </p>
          </div>

          {/* Contact Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Number *
            </label>
            <input
              type="tel"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="Enter your phone number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Call Ambulance Button */}
          <button
            onClick={handleSearchAmbulances}
            disabled={loading}
            className="w-full bg-red-600 text-white py-4 rounded-lg hover:bg-red-700 transition-colors font-semibold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>Searching for ambulances...</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span>Search for Available Ambulances</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderTrackingStep = () => (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Booking Confirmation Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white bg-opacity-20 rounded-full p-4">
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center mb-2">Ambulance Booked Successfully!</h2>
          <p className="text-center text-green-100">
            Help is on the way. Track your ambulance in real-time below.
          </p>
        </div>

        {/* Booking Details */}
        <div className="p-8">
          {bookingConfirmation && (
            <>
              {/* ETA Banner */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium mb-1">
                      Estimated Arrival Time
                    </p>
                    <p className="text-4xl font-bold text-blue-900">
                      {bookingConfirmation.estimatedArrival} min
                    </p>
                  </div>
                  <div className="bg-blue-100 p-4 rounded-full">
                    <svg
                      className="w-10 h-10 text-blue-600"
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
                  </div>
                </div>
              </div>

              {/* GPS Tracking Map Placeholder */}
              <div className="bg-gray-100 rounded-xl h-96 mb-6 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-50"></div>
                <div className="relative z-10 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500 rounded-full mb-4 animate-pulse">
                    <svg
                      className="w-10 h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
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
                  </div>
                  <p className="text-gray-600 font-medium">Real-time GPS Tracking</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Ambulance location updates every 10 seconds
                  </p>
                  <div className="mt-4 inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-md">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-700">Tracking Active</span>
                  </div>
                </div>
              </div>

              {/* Ambulance and Driver Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Ambulance Details */}
                <div className="border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Ambulance Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Service Provider</p>
                      <p className="font-semibold text-gray-900">
                        {bookingConfirmation.ambulance.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Vehicle Number</p>
                      <p className="font-semibold text-gray-900">
                        {bookingConfirmation.vehicleNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Distance</p>
                      <p className="font-semibold text-gray-900">
                        {bookingConfirmation.ambulance.distance.toFixed(1)} km away
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Rating</p>
                      <div className="flex items-center space-x-1">
                        <svg
                          className="w-5 h-5 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-semibold text-gray-900">
                          {bookingConfirmation.ambulance.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Driver Details */}
                <div className="border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Driver Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Driver Name</p>
                      <p className="font-semibold text-gray-900">
                        {bookingConfirmation.driverName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Contact Number</p>
                      <p className="font-semibold text-gray-900">
                        {bookingConfirmation.driverPhone}
                      </p>
                    </div>
                    <div className="pt-3">
                      <a
                        href={`tel:${bookingConfirmation.driverPhone}`}
                        className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center space-x-2"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <span>Call Driver</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Details */}
              <div className="border border-gray-200 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Emergency Type</p>
                    <p className="font-semibold text-gray-900">{emergencyType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact Number</p>
                    <p className="font-semibold text-gray-900">{contactNumber}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Patient Condition</p>
                    <p className="font-semibold text-gray-900">{patientCondition}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pickup Location</p>
                    <p className="font-semibold text-gray-900">
                      {patientLocation?.address}
                    </p>
                  </div>
                  {destination && (
                    <div>
                      <p className="text-sm text-gray-500">Destination</p>
                      <p className="font-semibold text-gray-900">{destination.address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking ID */}
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-600">
                  Booking ID:{' '}
                  <span className="font-mono font-semibold text-gray-900">
                    {bookingConfirmation.id}
                  </span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Save this ID for your records
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderSearchStep = () => (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Available Ambulances</h2>
            <p className="text-gray-600 mt-1">
              Found {availableAmbulances.length} ambulance(s) within 10km
            </p>
          </div>
          <button
            onClick={() => setStep('form')}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>Back to Form</span>
          </button>
        </div>

        {availableAmbulances.length === 0 ? (
          <div className="text-center py-12">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-500 text-lg font-medium">No ambulances available</p>
            <p className="text-gray-400 text-sm mt-2">
              Please try again or contact emergency services directly
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {availableAmbulances.map((ambulance) => (
              <div
                key={ambulance.id}
                className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="bg-red-100 p-3 rounded-lg">
                        <svg
                          className="w-6 h-6 text-red-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {ambulance.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Vehicle: {ambulance.vehicleNumber}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Distance</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {ambulance.distance ? ambulance.distance.toFixed(1) : '0.0'} km
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">ETA</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {ambulance.estimatedArrival || 'N/A'} min
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Rating</p>
                        <div className="flex items-center space-x-1">
                          <svg
                            className="w-4 h-4 text-yellow-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm font-semibold text-gray-900">
                            {ambulance.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Price</p>
                        <p className="text-sm font-semibold text-gray-900">
                          ${ambulance.price}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBookAmbulance(ambulance)}
                    disabled={loading && selectedAmbulance?.id === ambulance.id}
                    className="ml-4 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {loading && selectedAmbulance?.id === ambulance.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Booking...</span>
                      </>
                    ) : (
                      <span>Book Now</span>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      {step === 'form' && renderFormStep()}
      {step === 'search' && renderSearchStep()}
      {step === 'tracking' && renderTrackingStep()}
    </DashboardLayout>
  );
};

export default EmergencyServices;
