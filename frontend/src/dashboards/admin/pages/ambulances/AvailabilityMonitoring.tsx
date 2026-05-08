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
        {providers.map((provider: any) => {
          const id = provider._id || provider.id || provider.provider_id;
          const name = provider.serviceName || provider.provider_name || 'Unknown';
          const isOnline = provider.isAvailable ?? provider.is_online ?? false;
          const availableVehicles = provider.vehicles?.filter((v: any) => v.isActive)?.length ?? provider.available_vehicles ?? 0;
          const coverageArea = provider.baseAddress?.city || provider.coverage_area || '—';

          return (
            <div key={id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
                <div className="flex items-center space-x-2">
                  {isOnline ? (
                    <FiCheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <FiXCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                    {isOnline ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Active Vehicles:</span> {availableVehicles}</p>
                <p><span className="font-medium">Total Bookings:</span> {provider.totalBookings ?? 0}</p>
                <p><span className="font-medium">Coverage Area:</span> {coverageArea}</p>
                <p><span className="font-medium">Avg Response:</span> {provider.averageResponseTime ? `${provider.averageResponseTime} min` : '—'}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AvailabilityMonitoring;
