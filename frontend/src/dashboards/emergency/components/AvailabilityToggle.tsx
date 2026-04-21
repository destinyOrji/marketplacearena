// Availability Toggle Component

import React from 'react';

interface AvailabilityToggleProps {
  isAvailable: boolean;
  onChange: (available: boolean) => void;
  disabled?: boolean;
}

const AvailabilityToggle: React.FC<AvailabilityToggleProps> = ({
  isAvailable,
  onChange,
  disabled = false,
}) => {
  return (
    <button
      onClick={() => onChange(!isAvailable)}
      disabled={disabled}
      className={`relative inline-flex items-center gap-3 px-6 py-3 rounded-full font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
        isAvailable
          ? 'bg-green-600 text-white hover:bg-green-700'
          : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
      }`}
    >
      <div className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-white animate-pulse' : 'bg-gray-600'}`} />
      <span className="text-lg">
        {isAvailable ? 'Available for Emergencies' : 'Unavailable'}
      </span>
    </button>
  );
};

export default AvailabilityToggle;
