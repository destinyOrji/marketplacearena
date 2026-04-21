// BookingCard Component - Display emergency booking information

import React from 'react';
import { EmergencyBooking } from '../types';
import { format } from 'date-fns';

interface BookingCardProps {
  booking: EmergencyBooking;
  onViewDetails: (id: string) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, onViewDetails }) => {
  const statusColors = {
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const formatResponseTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{booking.emergencyType}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status]}`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
          </div>
          <p className="text-gray-600 mb-2">{booking.patient.name}</p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {format(new Date(booking.bookingDate), 'MMM dd, yyyy')}
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {booking.location}
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {formatResponseTime(booking.responseTime)}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-gray-900">${booking.payment.amount}</p>
          <p className="text-sm text-gray-600">
            {booking.payment.status === 'completed' ? 'Paid' : 'Failed'}
          </p>
        </div>
      </div>

      {/* Rating */}
      {booking.rating && (
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${i < booking.rating! ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-sm text-gray-600">{booking.rating.toFixed(1)}</span>
        </div>
      )}

      {/* Feedback */}
      {booking.feedback && (
        <p className="text-sm text-gray-600 mb-4 italic">"{booking.feedback}"</p>
      )}

      {/* Action Button */}
      <button
        onClick={() => onViewDetails(booking.id)}
        className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        aria-label={`View details for ${booking.emergencyType} booking`}
      >
        View Details
      </button>
    </div>
  );
};

export default BookingCard;
