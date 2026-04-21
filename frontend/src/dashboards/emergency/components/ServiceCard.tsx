// ServiceCard Component - Display emergency service information

import React from 'react';
import { EmergencyService } from '../types';

interface ServiceCardProps {
  service: EmergencyService;
  onEdit: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onEdit, onToggleStatus }) => {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
  };

  const serviceTypeLabels: Record<string, string> = {
    ambulance: 'Ambulance',
    paramedic: 'Paramedic',
    fire: 'Fire Response',
    rescue: 'Rescue',
    'medical-transport': 'Medical Transport',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Service Image */}
      <div className="relative h-48 bg-gradient-to-br from-red-500 to-red-700">
        {service.images && service.images.length > 0 ? (
          <img
            src={service.images[0]}
            alt={service.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[service.status]}`}>
            {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Service Details */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{service.description}</p>

        {/* Service Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Type:</span>
            <span className="font-medium text-gray-900">{serviceTypeLabels[service.serviceType]}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Response Time:</span>
            <span className="font-medium text-gray-900">{service.estimatedResponseTime} min</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Base Price:</span>
            <span className="font-semibold text-red-600">${service.basePrice}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Bookings:</span>
            <span className="font-medium text-gray-900">{service.bookingCount}</span>
          </div>
        </div>

        {/* Coverage Areas */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1">Coverage Areas:</p>
          <div className="flex flex-wrap gap-1">
            {service.coverageArea.slice(0, 3).map((area) => (
              <span key={area.id} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
                {area.name}
              </span>
            ))}
            {service.coverageArea.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                +{service.coverageArea.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(service.id)}
            className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            aria-label={`Edit ${service.name}`}
          >
            Edit
          </button>
          <button
            onClick={() => onToggleStatus(service.id)}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
            aria-label={`${service.status === 'active' ? 'Deactivate' : 'Activate'} ${service.name}`}
          >
            {service.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
