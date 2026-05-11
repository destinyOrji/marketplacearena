// ServiceCard component — redesigned with better visual hierarchy

import React from 'react';
import { Service } from '../types';
import { formatCurrency, formatDuration } from '../utils/formatting';

interface ServiceCardProps {
  service: Service;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

const STATUS_STYLES: Record<string, { badge: string; dot: string }> = {
  active:   { badge: 'bg-green-100 text-green-700 border-green-200',  dot: 'bg-green-500' },
  inactive: { badge: 'bg-gray-100 text-gray-600 border-gray-200',     dot: 'bg-gray-400' },
  pending:  { badge: 'bg-amber-100 text-amber-700 border-amber-200',  dot: 'bg-amber-400' },
};

const CATEGORY_COLORS: Record<string, string> = {
  consultation: 'bg-blue-50 text-blue-700',
  procedure:    'bg-purple-50 text-purple-700',
  therapy:      'bg-teal-50 text-teal-700',
  diagnostic:   'bg-indigo-50 text-indigo-700',
  emergency:    'bg-red-50 text-red-700',
  other:        'bg-gray-50 text-gray-700',
};

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onEdit, onDelete, onToggleStatus }) => {
  const statusStyle = STATUS_STYLES[service.status] || STATUS_STYLES.inactive;
  const categoryColor = CATEGORY_COLORS[service.category] || CATEGORY_COLORS.other;

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    const backendUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'https://healthmarketarena.com';
    return `${backendUrl}${imagePath}`;
  };

  const imageUrl = service.images?.length ? getImageUrl(service.images[0]) : null;

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
      service.status === 'active' ? 'border-gray-200 hover:border-blue-200' : 'border-gray-200 opacity-80'
    }`}>
      {/* Top accent */}
      <div className={`h-1 ${service.status === 'active' ? 'bg-gradient-to-r from-blue-500 to-blue-700' : 'bg-gray-300'}`} />

      {/* Image / Placeholder */}
      <div className="relative h-44 bg-gradient-to-br from-blue-500 to-blue-700 overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={service.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <svg className="w-14 h-14 text-white opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-white text-xs opacity-50 font-medium uppercase tracking-wide">
              {service.category}
            </span>
          </div>
        )}

        {/* Status badge overlay */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyle.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
            {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
          </span>
        </div>

        {/* Booking count */}
        {service.bookingCount > 0 && (
          <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
            {service.bookingCount} booking{service.bookingCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Title + category */}
        <div className="mb-3">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-base font-bold text-gray-900 leading-tight">{service.title}</h3>
            <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${categoryColor}`}>
              {service.category}
            </span>
          </div>
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{service.description}</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-gray-100 mb-3">
          <div className="text-center">
            <p className="text-lg font-bold text-blue-600">
              {formatCurrency(service.price)}
            </p>
            <p className="text-xs text-gray-400">Price</p>
          </div>
          <div className="text-center border-x border-gray-100">
            <p className="text-lg font-bold text-gray-800">{formatDuration(service.duration)}</p>
            <p className="text-xs text-gray-400">Duration</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-0.5">
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <p className="text-base font-bold text-gray-800">{(service as any).rating?.toFixed(1) || '—'}</p>
            </div>
            <p className="text-xs text-gray-400">{(service as any).reviewCount || 0} reviews</p>
          </div>
        </div>

        {/* Consultation types */}
        {service.consultationType && service.consultationType.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {service.consultationType.map((type) => (
              <span key={type}
                className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full border border-blue-100 font-medium">
                {type === 'in-person' ? '🏥 In-Person' : type === 'home-visit' ? '🏠 Home Visit' : '💻 Virtual'}
              </span>
            ))}
          </div>
        )}

        {/* Actions — pushed to bottom */}
        <div className="flex gap-2 mt-auto pt-2">
          <button onClick={() => onEdit(service.id)}
            className="flex-1 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            aria-label={`Edit ${service.title}`}>
            Edit
          </button>
          <button onClick={() => onToggleStatus(service.id)}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl border transition-colors ${
              service.status === 'active'
                ? 'border-gray-200 text-gray-600 hover:bg-gray-50'
                : 'border-blue-200 text-blue-600 hover:bg-blue-50'
            }`}
            aria-label={`${service.status === 'active' ? 'Deactivate' : 'Activate'} ${service.title}`}>
            {service.status === 'active' ? 'Pause' : 'Activate'}
          </button>
          <button onClick={() => onDelete(service.id)}
            className="px-3 py-2 bg-red-50 text-red-500 text-sm font-semibold rounded-xl hover:bg-red-100 border border-red-100 transition-colors"
            aria-label={`Delete ${service.title}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
