// Active Emergency Page
import React from 'react';

const ActiveEmergency: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Active Emergency</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-600">No active emergency at the moment.</p>
      </div>
    </div>
  );
};

export default ActiveEmergency;
