// Equipment Modal Component
import React, { useState } from 'react';
import { Equipment } from '../types';
import { equipmentApi } from '../services/api';
import { format } from 'date-fns';

interface EquipmentModalProps {
  equipment: Equipment | null;
  onClose: () => void;
  onSave: (equipment: Equipment) => void;
}

const EquipmentModal: React.FC<EquipmentModalProps> = ({ equipment, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: equipment?.name || '',
    category: equipment?.category || '',
    quantity: equipment?.quantity || 1,
    status: equipment?.status || 'available',
    lastInspection: equipment?.lastInspection ? format(new Date(equipment.lastInspection), 'yyyy-MM-dd') : '',
    nextInspection: equipment?.nextInspection ? format(new Date(equipment.nextInspection), 'yyyy-MM-dd') : '',
  });
  const [loading, setLoading] = useState(false);

  const categoryOptions = [
    'Medical Equipment',
    'Safety Equipment',
    'Communication Equipment',
    'Rescue Equipment',
    'Diagnostic Equipment',
    'Life Support',
    'Other',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        lastInspection: new Date(formData.lastInspection),
        nextInspection: new Date(formData.nextInspection),
      };

      let result;
      if (equipment) {
        result = await equipmentApi.updateEquipment(equipment.id, payload);
      } else {
        result = await equipmentApi.createEquipment(payload);
      }

      onSave(result);
    } catch (error) {
      console.error('Error saving equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {equipment ? 'Edit Equipment' : 'Add Equipment'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipment Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="e.g., Defibrillator"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              >
                <option value="">Select category</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="available">Available</option>
                <option value="in-use">In Use</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Inspection
              </label>
              <input
                type="date"
                value={formData.lastInspection}
                onChange={(e) => setFormData({ ...formData, lastInspection: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Next Inspection
              </label>
              <input
                type="date"
                value={formData.nextInspection}
                onChange={(e) => setFormData({ ...formData, nextInspection: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : equipment ? 'Update Equipment' : 'Add Equipment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EquipmentModal;
