import React, { useState } from 'react';
import { ServiceProvider } from '../types';
import { ServiceDetailsModal } from './index';

interface ServiceCardProps {
  provider: ServiceProvider;
  viewMode: 'grid' | 'list';
  onBook: (id: string) => void;
  onViewDetails: (id: string) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  provider,
  viewMode,
  onBook,
  onViewDetails,
}) => {
  const [showModal, setShowModal] = useState(false);

  // Get full image URL
  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const backendUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'https://healthmarketarena.com';
    return `${backendUrl}${imagePath}`;
  };

  const imageUrl = getImageUrl(provider.photo) || 
    (provider.images && provider.images.length > 0 ? getImageUrl(provider.images[0]) : null);

  console.log('Provider data:', provider);
  console.log('Image URL:', imageUrl);

  const handleViewDetails = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleBookNow = () => {
    onBook(provider.id);
  };

  // Render star rating
  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating.toFixed(1)} ({provider.reviewCount})
        </span>
      </div>
    );
  };

  // Grid view card
  if (viewMode === 'grid') {
    return (
      <>
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
          {/* Provider Photo */}
          <div className="relative h-48 bg-gradient-to-br from-blue-100 to-blue-200">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={`${provider.name}`}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl">
                  {(provider as any).providerType === 'gym-physio' ? '🏋️' : '🩺'}
                </span>
              </div>
            )}
            {provider.availability && (
              <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                Available
              </span>
            )}
          </div>

          {/* Card Content */}
          <div className="p-5">
            {/* Provider Name */}
            <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
              {provider.name}
            </h3>

            {/* Specialty/Type */}
            <p className="text-sm text-gray-600 mb-3">
              {provider.specialty || provider.type.charAt(0).toUpperCase() + provider.type.slice(1)}
            </p>

            {/* Rating */}
            <div className="mb-3">{renderRating(provider.rating)}</div>

            {/* Location */}
            <div className="flex items-center text-sm text-gray-600 mb-4">
              <svg
                className="w-4 h-4 mr-1 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
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
              <span className="truncate">{provider.location}</span>
            </div>

            {/* Price (if available) */}
            {provider.price && (
              <div className="mb-4">
                <span className="text-lg font-bold text-blue-600">
                  ₦{Number(provider.price).toLocaleString()}
                </span>
                <span className="text-sm text-gray-600"> / session</span>
              </div>
            )}

            {/* Provider type badge */}
            {(provider as any).providerType === 'gym-physio' && (
              <div className="mb-3">
                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                  🏋️ Gym & Physio
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={handleViewDetails}
                className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label={`View details for ${provider.name}`}
              >
                View Details
              </button>
              <button
                onClick={handleBookNow}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label={`Book appointment with ${provider.name}`}
              >
                Book Now
              </button>
            </div>
          </div>
        </div>

        {/* Details Modal */}
        <ServiceDetailsModal
          provider={provider}
          isOpen={showModal}
          onClose={handleCloseModal}
          onBook={handleBookNow}
        />
      </>
    );
  }

  // List view card
  return (
    <>
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
        <div className="flex">
          {/* Provider Photo */}
          <div className="relative w-48 h-48 flex-shrink-0 bg-gradient-to-br from-blue-100 to-blue-200">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={`${provider.name}`}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-5xl">
                  {(provider as any).providerType === 'gym-physio' ? '🏋️' : '🩺'}
                </span>
              </div>
            )}
            {provider.availability && (
              <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                Available
              </span>
            )}
          </div>

          {/* Card Content */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              {/* Provider Name and Type */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {provider.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {provider.specialty || provider.type.charAt(0).toUpperCase() + provider.type.slice(1)}
                  </p>
                </div>
                {provider.price && (
                  <div className="text-right">
                    <span className="text-2xl font-bold text-blue-600">
                      ₦{Number(provider.price).toLocaleString()}
                    </span>
                    <p className="text-xs text-gray-600">/ session</p>
                  </div>
                )}
              </div>

              {/* Rating and Location */}
              <div className="flex items-center space-x-6 mt-3">
                <div>{renderRating(provider.rating)}</div>
                <div className="flex items-center text-sm text-gray-600">
                  <svg
                    className="w-4 h-4 mr-1 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
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
                  <span>{provider.location}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 mt-4">
              <button
                onClick={handleViewDetails}
                className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label={`View details for ${provider.name}`}
              >
                View Details
              </button>
              <button
                onClick={handleBookNow}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label={`Book appointment with ${provider.name}`}
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      <ServiceDetailsModal
        provider={provider}
        isOpen={showModal}
        onClose={handleCloseModal}
        onBook={handleBookNow}
      />
    </>
  );
};

export default ServiceCard;
