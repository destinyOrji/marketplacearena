/**
 * Fleet Management View
 * Display and manage vehicles for a provider
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiTruck } from 'react-icons/fi';
import { Button, Modal } from '../../components';
import { ambulanceService } from '../../services/ambulanceService';
import { Vehicle } from '../../types';

const FleetManagement: React.FC = () => {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggleModal, setToggleModal] = useState<{ show: boolean; vehicle: Vehicle | null; newStatus: string }>({
    show: false,
    vehicle: null,
    newStatus: ''
  });

  useEffect(() => {
    if (providerId) {
      fetchVehicles();
    }
  }, [providerId]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await ambulanceService.getProviderVehicles(providerId!);
      setVehicles(data);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = (vehicle: Vehicle, newStatus: string) => {
    setToggleModal({ show: true, vehicle, newStatus });
  };

  const handleToggleConfirm = async () => {
    if (!toggleModal.vehicle) return;

    try {
      await ambulanceService.toggleVehicleStatus(
        providerId!,
        toggleModal.vehicle.id,
        toggleModal.newStatus
      );
      setToggleModal({ show: false, vehicle: null, newStatus: '' });
      fetchVehicles();
    } catch (error) {
      console.error('Failed to toggle vehicle status:', error);
      alert('Failed to update vehicle status.');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate(`/admin/ambulances/${providerId}`)} className="text-gray-600 hover:text-gray-900">
          <FiChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Fleet Management</h1>
      </div>

      {vehicles.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FiTruck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No vehicles found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{vehicle.vehicle_number}</h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(vehicle.status)}`}>
                  {vehicle.status}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Type:</span> {vehicle.vehicle_type}</p>
                <p><span className="font-medium">Model:</span> {vehicle.model} ({vehicle.year})</p>
                <p><span className="font-medium">Registration:</span> {vehicle.registration_number}</p>
                <p><span className="font-medium">Available:</span> {vehicle.is_available ? 'Yes' : 'No'}</p>
              </div>
              <div className="mt-4 flex space-x-2">
                {vehicle.status === 'active' && (
                  <Button size="sm" variant="secondary" onClick={() => handleToggleStatus(vehicle, 'inactive')}>
                    Deactivate
                  </Button>
                )}
                {vehicle.status === 'inactive' && (
                  <Button size="sm" variant="primary" onClick={() => handleToggleStatus(vehicle, 'active')}>
                    Activate
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={toggleModal.show}
        onClose={() => setToggleModal({ show: false, vehicle: null, newStatus: '' })}
        title="Update Vehicle Status"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Change status of vehicle <strong>{toggleModal.vehicle?.vehicle_number}</strong> to{' '}
            <strong>{toggleModal.newStatus}</strong>?
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setToggleModal({ show: false, vehicle: null, newStatus: '' })}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleToggleConfirm}>
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FleetManagement;
