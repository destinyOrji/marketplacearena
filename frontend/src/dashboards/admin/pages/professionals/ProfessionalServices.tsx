/**
 * Professional Services View
 * List all services offered by a professional with activation controls
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiXCircle as FiCircle, FiCheckCircle } from 'react-icons/fi';
import { Button } from '../../components';
import { professionalService } from '../../services/professionalService';
import { ProfessionalService } from '../../types';

const ProfessionalServices: React.FC = () => {
  const { professionalId } = useParams<{ professionalId: string }>();
  const navigate = useNavigate();
  const [services, setServices] = useState<ProfessionalService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (professionalId) {
      fetchServices();
    }
  }, [professionalId]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await professionalService.getProfessionalServices(professionalId!);
      setServices(data);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (serviceId: string, currentStatus: boolean) => {
    try {
      await professionalService.toggleServiceStatus(
        professionalId!,
        serviceId,
        !currentStatus
      );
      fetchServices();
    } catch (error) {
      console.error('Failed to toggle service status:', error);
      alert('Failed to update service status. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/admin/professionals/${professionalId}`)}
            className="text-gray-600 hover:text-gray-900"
          >
            <FiChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Professional Services</h1>
        </div>
      </div>

      {/* Services List */}
      {services.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No services found for this professional.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{service.service_name}</h3>
                  <p className="text-sm text-gray-600 mt-2">{service.description}</p>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Price:</span>
                      <span className="text-base font-medium text-gray-900">${service.price.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Duration:</span>
                      <span className="text-base font-medium text-gray-900">{service.duration_minutes} minutes</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Status:</span>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          service.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {service.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Created:</span>
                      <span className="text-sm text-gray-700">
                        {new Date(service.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleToggleStatus(String(service.id), service.is_active)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    service.is_active
                      ? 'bg-red-50 text-red-700 hover:bg-red-100'
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                >
                  {service.is_active ? (
                    <>
                      <FiCheckCircle className="h-5 w-5" />
                      <span>Deactivate Service</span>
                    </>
                  ) : (
                    <>
                      <FiCircle className="h-5 w-5" />
                      <span>Activate Service</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfessionalServices;
