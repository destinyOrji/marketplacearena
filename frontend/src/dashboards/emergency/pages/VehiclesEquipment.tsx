// Vehicles & Equipment Page
import React, { useState, useEffect } from 'react';
import { Vehicle, Equipment } from '../types';
import { vehiclesApi, equipmentApi } from '../services/api';
import { format } from 'date-fns';
import VehicleModal from '../components/VehicleModal';
import EquipmentModal from '../components/EquipmentModal';

const VehiclesEquipment: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'vehicles' | 'equipment'>('vehicles');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vehiclesData, equipmentData] = await Promise.all([
        vehiclesApi.getVehicles(),
        equipmentApi.getEquipment(),
      ]);
      setVehicles(vehiclesData);
      setEquipment(equipmentData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = () => {
    setSelectedVehicle(null);
    setShowVehicleModal(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowVehicleModal(true);
  };

  const handleDeleteVehicle = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) {
      return;
    }

    try {
      await vehiclesApi.deleteVehicle(id);
      setVehicles(vehicles.filter(v => v.id !== id));
    } catch (error) {
      console.error('Error deleting vehicle:', error);
    }
  };

  const handleAddEquipment = () => {
    setSelectedEquipment(null);
    setShowEquipmentModal(true);
  };

  const handleEditEquipment = (item: Equipment) => {
    setSelectedEquipment(item);
    setShowEquipmentModal(true);
  };

  const handleDeleteEquipment = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this equipment?')) {
      return;
    }

    try {
      await equipmentApi.deleteEquipment(id);
      setEquipment(equipment.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error deleting equipment:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-700';
      case 'in-use':
        return 'bg-blue-100 text-blue-700';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredVehicles = statusFilter === 'all'
    ? vehicles
    : vehicles.filter(v => v.status === statusFilter);

  const filteredEquipment = statusFilter === 'all'
    ? equipment
    : equipment.filter(e => e.status === statusFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vehicles & Equipment</h1>
        <button
          onClick={activeTab === 'vehicles' ? handleAddVehicle : handleAddEquipment}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          + Add {activeTab === 'vehicles' ? 'Vehicle' : 'Equipment'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('vehicles')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'vehicles'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Vehicles ({vehicles.length})
        </button>
        <button
          onClick={() => setActiveTab('equipment')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'equipment'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Equipment ({equipment.length})
        </button>
      </div>

      {/* Status Filter */}
      <div className="mb-6">
        <div className="flex gap-2">
          {['all', 'available', 'in-use', 'maintenance'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'vehicles' ? (
        <VehiclesView
          vehicles={filteredVehicles}
          onEdit={handleEditVehicle}
          onDelete={handleDeleteVehicle}
          getStatusColor={getStatusColor}
        />
      ) : (
        <EquipmentView
          equipment={filteredEquipment}
          onEdit={handleEditEquipment}
          onDelete={handleDeleteEquipment}
          getStatusColor={getStatusColor}
        />
      )}

      {/* Modals */}
      {showVehicleModal && (
        <VehicleModal
          vehicle={selectedVehicle}
          onClose={() => setShowVehicleModal(false)}
          onSave={(vehicle) => {
            if (selectedVehicle) {
              setVehicles(vehicles.map(v => v.id === vehicle.id ? vehicle : v));
            } else {
              setVehicles([...vehicles, vehicle]);
            }
            setShowVehicleModal(false);
          }}
        />
      )}

      {showEquipmentModal && (
        <EquipmentModal
          equipment={selectedEquipment}
          onClose={() => setShowEquipmentModal(false)}
          onSave={(item) => {
            if (selectedEquipment) {
              setEquipment(equipment.map(e => e.id === item.id ? item : e));
            } else {
              setEquipment([...equipment, item]);
            }
            setShowEquipmentModal(false);
          }}
        />
      )}
    </div>
  );
};

// Vehicles View Component
interface VehiclesViewProps {
  vehicles: Vehicle[];
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: string) => void;
  getStatusColor: (status: string) => string;
}

const VehiclesView: React.FC<VehiclesViewProps> = ({ vehicles, onEdit, onDelete, getStatusColor }) => {
  if (vehicles.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-600">No vehicles found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vehicles.map((vehicle) => (
        <div key={vehicle.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Vehicle Image */}
          <div className="h-48 bg-gray-200 flex items-center justify-center">
            {vehicle.images && vehicle.images.length > 0 ? (
              <img src={vehicle.images[0]} alt={vehicle.type} className="w-full h-full object-cover" />
            ) : (
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
            )}
          </div>

          {/* Vehicle Info */}
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900">{vehicle.type}</h3>
                <p className="text-sm text-gray-600">{vehicle.make} {vehicle.model} ({vehicle.year})</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                {vehicle.status}
              </span>
            </div>

            <div className="space-y-1 text-sm text-gray-600 mb-4">
              <p>License: {vehicle.licensePlate}</p>
              <p>Capacity: {vehicle.capacity} persons</p>
              {vehicle.nextMaintenance && (
                <p>Next Maintenance: {format(new Date(vehicle.nextMaintenance), 'MMM dd, yyyy')}</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onEdit(vehicle)}
                className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(vehicle.id)}
                className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Equipment View Component
interface EquipmentViewProps {
  equipment: Equipment[];
  onEdit: (equipment: Equipment) => void;
  onDelete: (id: string) => void;
  getStatusColor: (status: string) => string;
}

const EquipmentView: React.FC<EquipmentViewProps> = ({ equipment, onEdit, onDelete, getStatusColor }) => {
  if (equipment.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p className="text-gray-600">No equipment found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Inspection</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {equipment.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{item.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {item.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {item.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {format(new Date(item.nextInspection), 'MMM dd, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button
                    onClick={() => onEdit(item)}
                    className="text-blue-600 hover:text-blue-800 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VehiclesEquipment;
