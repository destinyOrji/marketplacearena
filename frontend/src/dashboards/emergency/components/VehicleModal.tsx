import React, { useState } from 'react';
import { vehiclesApi } from '../services/api';
import { toast } from 'react-toastify';

interface VehicleModalProps {
  vehicle: any | null;
  onClose: () => void;
  onSave: (vehicle: any) => void;
}

const vehicleTypes = ['basic', 'advanced', 'critical_care', 'air_ambulance'];
const equipmentOptions = [
  'Defibrillator', 'Oxygen Tank', 'Stretcher', 'First Aid Kit',
  'IV Drip', 'Ventilator', 'Suction Machine', 'Cardiac Monitor',
  'Pulse Oximeter', 'Blood Pressure Monitor', 'Spine Board',
];

const VehicleModal: React.FC<VehicleModalProps> = ({ vehicle, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    vehicleNumber: vehicle?.vehicleNumber || '',
    vehicleType: vehicle?.vehicleType || 'basic',
    capacity: vehicle?.capacity || 4,
    isActive: vehicle?.isActive !== undefined ? vehicle.isActive : true,
    equipment: vehicle?.equipment || [] as string[],
  });
  const [loading, setLoading] = useState(false);

  const toggleEquipment = (item: string) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.includes(item)
        ? prev.equipment.filter((e: string) => e !== item)
        : [...prev.equipment, item],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleNumber.trim()) {
      toast.error('Vehicle number is required');
      return;
    }
    setLoading(true);
    try {
      let result;
      if (vehicle?._id || vehicle?.id) {
        result = await vehiclesApi.updateVehicle(vehicle._id || vehicle.id, formData);
      } else {
        result = await vehiclesApi.createVehicle(formData);
      }
      toast.success(vehicle ? 'Vehicle updated' : 'Vehicle added');
      onSave(result);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{vehicle ? 'Edit Vehicle' : 'Add Vehicle'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number / Plate *</label>
            <input
              type="text"
              value={formData.vehicleNumber}
              onChange={e => setFormData({ ...formData, vehicleNumber: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="e.g., ABC-1234"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type *</label>
            <select
              value={formData.vehicleType}
              onChange={e => setFormData({ ...formData, vehicleType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {vehicleTypes.map(t => (
                <option key={t} value={t}>{t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (persons)</label>
            <input
              type="number"
              value={formData.capacity}
              onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              min={1} max={20}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Equipment</label>
            <div className="flex flex-wrap gap-2">
              {equipmentOptions.map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleEquipment(item)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    formData.equipment.includes(item)
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-red-600 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">Active (available for dispatch)</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={loading}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50">
              {loading ? 'Saving...' : vehicle ? 'Update' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleModal;
