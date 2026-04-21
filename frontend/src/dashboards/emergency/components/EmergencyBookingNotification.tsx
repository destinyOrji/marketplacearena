// Emergency Booking Notification Modal

import React, { useState, useEffect } from 'react';
import { PendingEmergencyBooking } from '../types';
import { formatCurrency, formatDistance } from '../utils';

interface EmergencyBookingNotificationProps {
  booking: PendingEmergencyBooking;
  onAccept: () => void;
  onDecline: () => void;
}

const EmergencyBookingNotification: React.FC<EmergencyBookingNotificationProps> = ({
  booking,
  onAccept,
  onDecline,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(60);

  useEffect(() => {
    // Play sound alert
    const audio = new Audio('/sounds/emergency-alert.mp3');
    audio.play().catch(console.error);

    // Countdown timer
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onDecline(); // Auto-decline
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onDecline]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 animate-pulse-slow">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
        {/* Header */}
        <div className={`${getSeverityColor(booking.severity)} text-white p-6 rounded-t-2xl`}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold">🚨 EMERGENCY BOOKING</h2>
            <div className="text-3xl font-bold">{timeRemaining}s</div>
          </div>
          <p className="text-lg opacity-90">{booking.emergencyType}</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Location */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
            <p className="text-gray-700">{booking.location.address}</p>
            <p className="text-sm text-gray-600 mt-1">
              Distance: {formatDistance(booking.distance)}
            </p>
          </div>

          {/* Patient Info */}
          {booking.patientInfo && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Patient Information</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                {booking.patientInfo.age && (
                  <div>
                    <span className="text-gray-600">Age:</span>
                    <span className="ml-2 font-medium">{booking.patientInfo.age}</span>
                  </div>
                )}
                {booking.patientInfo.gender && (
                  <div>
                    <span className="text-gray-600">Gender:</span>
                    <span className="ml-2 font-medium">{booking.patientInfo.gender}</span>
                  </div>
                )}
                {booking.patientInfo.medicalCondition && (
                  <div className="col-span-3">
                    <span className="text-gray-600">Condition:</span>
                    <span className="ml-2 font-medium">{booking.patientInfo.medicalCondition}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Estimated Payment:</span>
              <span className="text-2xl font-bold text-green-600">
                {formatCurrency(booking.estimatedPayment)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 flex gap-4">
          <button
            onClick={onDecline}
            className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={onAccept}
            className="flex-1 px-6 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors text-lg"
          >
            ACCEPT EMERGENCY
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyBookingNotification;
