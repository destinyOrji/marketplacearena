// ServiceCard component for displaying service information

import React from 'react';
import { Service } from '../types';
import { formatCurrency, formatDuration } from '../utils/formatting';

interface ServiceCardProps {
  service: Service;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onEdit, onDelete, onToggleStatus }) => {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
  };

  // Get full image URL
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    // If already a full URL, return as is
    if (imagePath.startsWith('http')) return imagePath;
    // Otherwise, prepend the backend URL
    const backendUrl = process.env.REACT_APP_API_URL?.replace('/api/v1', '') || 'https://healthmarketarena.com';
    return `${backendUrl}${imagePath}`;
  };

  const imageUrl = service.images && service.images.length > 0 ? getImageUrl(service.images[0]) : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Service Image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-blue-700">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={service.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              console.error('Image failed to load:', imageUrl);
              // Hide image on error and show placeholder
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
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
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{service.description}</p>

        {/* Service Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Category:</span>
            <span className="font-medium text-gray-900">{service.category}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Duration:</span>
            <span className="font-medium text-gray-900">{formatDuration(service.duration)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Price:</span>
            <span className="font-semibold text-blue-600">{formatCurrency(service.price)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Bookings:</span>
            <span className="font-medium text-gray-900">{service.bookingCount}</span>
          </div>
        </div>

        {/* Consultation Types */}
        {service.consultationType && service.consultationType.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {service.consultationType.map((type) => (
              <span
                key={type}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
              >
                {type === 'in-person' ? 'In-Person' : type === 'home-visit' ? 'Home Visit' : 'Virtual'}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(service.id)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            aria-label={`Edit ${service.title}`}
          >
            Edit
          </button>
          <button
            onClick={() => onToggleStatus(service.id)}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
            aria-label={`${service.status === 'active' ? 'Deactivate' : 'Activate'} ${service.title}`}
          >
            {service.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={() => onDelete(service.id)}
            className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors"
            aria-label={`Delete ${service.title}`}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
