import React, { useEffect, useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { getServices } from '../services/api';
import type { Service } from '../types';

const MyServices: React.FC = () => {
  const { showError } = useNotification();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await getServices();
        setServices(data);
      } catch (error: any) {
        showError(error.message || 'Failed to load services');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [showError]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Services</h1>
        <button className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
          Add New Service
        </button>
      </div>

      {services.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-600 mb-4">No services yet</p>
          <button className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
            Create Your First Service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{service.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{service.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-orange-600">${service.price}</span>
                <span className="text-sm text-gray-600">{service.duration} min</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyServices;
