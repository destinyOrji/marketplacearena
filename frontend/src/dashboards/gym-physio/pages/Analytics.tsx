import React from 'react';

const Analytics: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Booking Trends</h2>
          <p className="text-gray-600 text-center py-8">No data available</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Popular Services</h2>
          <p className="text-gray-600 text-center py-8">No data available</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Client Demographics</h2>
          <p className="text-gray-600 text-center py-8">No data available</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Revenue Overview</h2>
          <p className="text-gray-600 text-center py-8">No data available</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
