// Coverage Areas Page
import React, { useState, useEffect } from 'react';
import { CoverageZone } from '../types';
import { coverageApi } from '../services/api';

const CoverageAreas: React.FC = () => {
  const [coverageAreas, setCoverageAreas] = useState<CoverageZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedArea, setSelectedArea] = useState<CoverageZone | null>(null);

  useEffect(() => {
    fetchCoverageAreas();
  }, []);

  const fetchCoverageAreas = async () => {
    try {
      const data = await coverageApi.getCoverageAreas();
      setCoverageAreas(data);
    } catch (error) {
      console.error('Error fetching coverage areas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddArea = () => {
    setSelectedArea(null);
    setShowAddModal(true);
  };

  const handleEditArea = (area: CoverageZone) => {
    setSelectedArea(area);
    setShowAddModal(true);
  };

  const handleDeleteArea = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this coverage area?')) {
      return;
    }

    try {
      await coverageApi.deleteCoverageArea(id);
      setCoverageAreas(coverageAreas.filter(area => area.id !== id));
    } catch (error) {
      console.error('Error deleting coverage area:', error);
    }
  };

  const handleToggleActive = async (area: CoverageZone) => {
    try {
      const updated = await coverageApi.updateCoverageArea(area.id, {
        isActive: !area.isActive,
      });
      setCoverageAreas(coverageAreas.map(a => a.id === area.id ? updated : a));
    } catch (error) {
      console.error('Error updating coverage area:', error);
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Coverage Areas</h1>
        <button
          onClick={handleAddArea}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          + Add Coverage Area
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map View */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Coverage Map</h2>
          <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <p>Map integration placeholder</p>
              <p className="text-sm mt-1">Google Maps / Mapbox integration</p>
            </div>
          </div>
        </div>

        {/* Coverage Areas List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Coverage Zones</h2>
          
          {coverageAreas.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <p className="text-gray-600 mb-4">No coverage areas defined yet</p>
              <button
                onClick={handleAddArea}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Add Your First Coverage Area
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {coverageAreas.map((area) => (
                <div
                  key={area.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-red-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{area.name}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {area.serviceTypes.map((type, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                      {area.radius && (
                        <p className="text-sm text-gray-600 mt-2">
                          Radius: {(area.radius / 1000).toFixed(1)} km
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(area)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          area.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {area.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleEditArea(area)}
                      className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteArea(area.id)}
                      className="flex-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <CoverageAreaModal
          area={selectedArea}
          onClose={() => setShowAddModal(false)}
          onSave={(area) => {
            if (selectedArea) {
              setCoverageAreas(coverageAreas.map(a => a.id === area.id ? area : a));
            } else {
              setCoverageAreas([...coverageAreas, area]);
            }
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
};

// Coverage Area Modal Component
interface CoverageAreaModalProps {
  area: CoverageZone | null;
  onClose: () => void;
  onSave: (area: CoverageZone) => void;
}

const CoverageAreaModal: React.FC<CoverageAreaModalProps> = ({ area, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: area?.name || '',
    serviceTypes: area?.serviceTypes || [],
    radius: area?.radius ? area.radius / 1000 : 5,
    isActive: area?.isActive ?? true,
  });
  const [loading, setLoading] = useState(false);

  const serviceTypeOptions = [
    'ambulance',
    'paramedic',
    'fire',
    'rescue',
    'medical-transport',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        serviceTypes: formData.serviceTypes,
        radius: formData.radius * 1000,
        isActive: formData.isActive,
        boundaries: [], // Placeholder - would be set via map drawing
      };

      let result;
      if (area) {
        result = await coverageApi.updateCoverageArea(area.id, payload);
      } else {
        result = await coverageApi.createCoverageArea(payload);
      }

      onSave(result);
    } catch (error) {
      console.error('Error saving coverage area:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleServiceType = (type: string) => {
    if (formData.serviceTypes.includes(type)) {
      setFormData({
        ...formData,
        serviceTypes: formData.serviceTypes.filter(t => t !== type),
      });
    } else {
      setFormData({
        ...formData,
        serviceTypes: [...formData.serviceTypes, type],
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {area ? 'Edit Coverage Area' : 'Add Coverage Area'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Area Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="e.g., Downtown District"
              required
            />
          </div>

          {/* Service Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Types
            </label>
            <div className="flex flex-wrap gap-2">
              {serviceTypeOptions.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleServiceType(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.serviceTypes.includes(type)
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Radius */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coverage Radius (km)
            </label>
            <input
              type="number"
              value={formData.radius}
              onChange={(e) => setFormData({ ...formData, radius: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              min="1"
              max="100"
              step="0.5"
              required
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
              Set as active immediately
            </label>
          </div>

          {/* Map Drawing Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Define Boundaries
            </label>
            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <p className="text-sm">Draw coverage area on map</p>
                <p className="text-xs mt-1">Map drawing tools will be integrated here</p>
              </div>
            </div>
          </div>

          {/* Actions */}
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
              disabled={loading || formData.serviceTypes.length === 0}
            >
              {loading ? 'Saving...' : area ? 'Update Area' : 'Add Area'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CoverageAreas;
