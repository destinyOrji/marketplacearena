/**
 * Availability Monitoring View
 * Display real-time provider availability status
 */
import React, { useState, useEffect } from 'react';
import { FiXCircle, FiCheckCircle } from 'react-icons/fi';
import { ambulanceService } from '../../services/ambulanceService';
import { ProviderAvailability } from '../../types';

const AvailabilityMonitoring: React.FC = () => {
  const [providers, setProviders] = useState<ProviderAvailability[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailability();
    const interval = setInterval(fetchAvailability, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const data = await ambulanceService.getProviderAvailability();
      setProviders(data);
    } catch (error) {
      console.error('Failed to fetch availability:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Provider Availability</h1>
        <p className="text-sm text-gray-500">Auto-refreshes every 30 seconds</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {providers.map((provider) => (
          <div key={provider.provider_id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{provider.provider_name}</h3>
              <div className="flex items-center space-x-2">
                {provider.is_online ? (
                  <FiCheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <FiXCircle className="h-3 w-3 text-gray-400" />
                )}
                <span className="text-sm text-gray-600">{provider.is_online ? 'Online' : 'Offline'}</span>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">Available Vehicles:</span> {provider.available_vehicles}</p>
              <p><span className="font-medium">Active Bookings:</span> {provider.active_bookings}</p>
              <p><span className="font-medium">Coverage Area:</span> {provider.coverage_area}</p>
              <p><span className="font-medium">Last Active:</span> {new Date(provider.last_active).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailabilityMonitoring;
