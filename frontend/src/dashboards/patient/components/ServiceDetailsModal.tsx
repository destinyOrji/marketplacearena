import React from 'react';
import { ServiceProvider } from '../types';

interface ServiceDetailsModalProps {
  provider: ServiceProvider;
  isOpen: boolean;
  onClose: () => void;
  onBook: () => void;
}

const ServiceDetailsModal: React.FC<ServiceDetailsModalProps> = ({
  provider,
  isOpen,
  onClose,
  onBook,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-2 text-lg font-semibold text-gray-900">
          {rating.toFixed(1)}
        </span>
        <span className="ml-1 text-sm text-gray-600">
          ({provider.reviewCount} reviews)
        </span>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">Service Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Provider Photo and Basic Info */}
          <div className="flex items-start space-x-6 mb-6">
            <img
              src={provider.photo || '/default-avatar.png'}
              alt={provider.name}
              className="w-32 h-32 rounded-xl object-cover"
            />
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {provider.name}
                  </h3>
                  <p className="text-gray-600">
                    {provider.specialty || provider.type.charAt(0).toUpperCase() + provider.type.slice(1)}
                  </p>
                </div>
                {provider.availability && (
                  <span className="bg-green-500 text-white text-sm font-medium px-4 py-1 rounded-full">
                    Available
                  </span>
                )}
              </div>
              <div className="mt-3">{renderRating(provider.rating)}</div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-6"></div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Location */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Location</h4>
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0"
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
                <p className="text-gray-900">{provider.location}</p>
              </div>
            </div>

            {/* Service Type */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Service Type</h4>
              <p className="text-gray-900 capitalize">{provider.type}</p>
            </div>

            {/* Price */}
            {provider.price && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Consultation Fee</h4>
                <p className="text-2xl font-bold text-blue-600">${provider.price}</p>
              </div>
            )}

            {/* Availability Status */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Availability</h4>
              <p className={`font-medium ${provider.availability ? 'text-green-600' : 'text-gray-600'}`}>
                {provider.availability ? 'Available Now' : 'Not Available'}
              </p>
            </div>
          </div>

          {/* About Section */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">About</h4>
            <p className="text-gray-700 leading-relaxed">
              {provider.specialty
                ? `Specialized in ${provider.specialty} with extensive experience in providing quality healthcare services. Committed to patient care and well-being.`
                : `Professional ${provider.type} service provider dedicated to delivering excellent healthcare services to patients.`}
            </p>
          </div>

          {/* Services Offered (Mock data) */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Services Offered</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-gray-700">Video Consultations</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-gray-700">In-Person Appointments</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-gray-700">Chat Consultations</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-gray-700">Prescription Services</span>
              </li>
            </ul>
          </div>

          {/* Working Hours (Mock data) */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Working Hours</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Monday - Friday</span>
                <span className="text-gray-900 font-medium">9:00 AM - 5:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Saturday</span>
                <span className="text-gray-900 font-medium">10:00 AM - 2:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sunday</span>
                <span className="text-gray-900 font-medium">Closed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end space-x-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Close
          </button>
          <button
            onClick={onBook}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailsModal;
