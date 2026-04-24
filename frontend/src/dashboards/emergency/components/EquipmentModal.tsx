import React, { useState } from 'react';
import { equipmentApi } from '../services/api';
import { toast } from 'react-toastify';

interface EquipmentModalProps {
  equipment: any | null;
  vehicles: any[];
  onClose: () => void;
  onSave: (equipment: any) => void;
}

const categoryOptions = [
  'Medical Equipment', 'Safety Equipment', 'Communication Equipment',
  'Rescue Equipment', 'Diagnostic Equipment', 'Life Support', 'Other',
];

const EquipmentModal: React.FC<EquipmentModalProps> = ({ equipment, vehicles, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: equipment?.name || '',
    category: equipment?.category || '',
    quantity: equipment?.quantity || 1,
    status: equipment?.status || 'operational',
    vehicleId: equipment?.vehicleId || (vehicles[0]?._id || vehicles[0]?.id || ''),
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { toast.error('Equipment name is required'); return; }
    setLoading(true);
    try {
      const result = await equipmentApi.createEquipment({ name: formData.name, vehicleId: formData.vehicleId });
      toast.success('Equipment added');
      onSave({ ...result, ...formData });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save equipment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{equipment ? 'Edit Equipment' : 'Add Equipment'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="e.g., Defibrillator"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Select category</option>
              {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {vehicles.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Vehicle</label>
              <select
                value={formData.vehicleId}
                onChange={e => setFormData({ ...formData, vehicleId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {vehicles.map((v: any) => (
                  <option key={v._id || v.id} value={v._id || v.id}>
                    {v.vehicleNumber} ({v.vehicleType})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={loading}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50">
              {loading ? 'Saving...' : 'Add Equipment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EquipmentModal;
