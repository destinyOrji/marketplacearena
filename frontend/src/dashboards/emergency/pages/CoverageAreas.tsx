// Coverage Areas Page
import React, { useState, useEffect } from 'react';
import { CoverageZone } from '../types';
import { coverageApi } from '../services/api';
import Map from '../../../components/Map';

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
      <div className="flex items-center justify-between mb-6 relative z-[1000]">
        <h1 className="text-2xl font-bold text-gray-900">Coverage Areas</h1>
        <button
          onClick={handleAddArea}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg relative z-[1000]"
        >
          + Add Coverage Area
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map View */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative z-[1]">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50 relative z-[2]">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">🗺️</span>
              Coverage Map
            </h2>
            <p className="text-sm text-gray-600 mt-1">View all your active coverage areas across Nigeria</p>
          </div>
          <div className="p-6 relative z-[1]">
            <div className="relative z-[1]">
              <Map
                height="450px"
                center={[9.0820, 8.6753]} // Nigeria center
                zoom={6}
                circles={coverageAreas
                  .filter(area => area.isActive)
                  .map(area => ({
                    center: area.center ? [area.center.latitude, area.center.longitude] : [9.0820, 8.6753],
                    radius: area.radius || 5000,
                    color: '#ef4444',
                  }))}
              />
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-3 h-3 bg-red-500 rounded-full opacity-30 border-2 border-red-500"></span>
                <span>Active Coverage Areas</span>
              </div>
              <div className="text-sm text-gray-500">
                {coverageAreas.filter(area => area.isActive).length} active zone{coverageAreas.filter(area => area.isActive).length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Coverage Areas List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative z-[2]">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 relative z-[3]">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">📍</span>
              Coverage Zones
            </h2>
            <p className="text-sm text-gray-600 mt-1">Manage your service coverage areas</p>
          </div>
          
          <div className="p-6">
            {coverageAreas.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No coverage areas yet</h3>
                <p className="text-gray-600 mb-6 text-sm">Define your service coverage areas to start receiving emergency requests</p>
                <button
                  onClick={handleAddArea}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Your First Coverage Area
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
                {coverageAreas.map((area) => (
                  <div
                    key={area.id}
                    className="border border-gray-200 rounded-xl p-4 hover:border-red-300 hover:shadow-md transition-all bg-gradient-to-br from-white to-gray-50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 text-base">{area.name}</h3>
                          <button
                            onClick={() => handleToggleActive(area)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                              area.isActive
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}
                          >
                            {area.isActive ? '✓ Active' : 'Inactive'}
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {area.serviceTypes.map((type, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium border border-blue-100"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                        {area.radius && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            <span>Coverage Radius: <strong>{(area.radius / 1000).toFixed(1)} km</strong></span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditArea(area)}
                        className="flex-1 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium border border-gray-200 flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteArea(area.id)}
                        className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium border border-red-200 flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
    center: area?.center || null,
    boundaries: area?.boundaries || [],
  });
  const [loading, setLoading] = useState(false);
  const [drawnShape, setDrawnShape] = useState<any>(null);

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
      const payload: any = {
        name: formData.name,
        serviceTypes: formData.serviceTypes,
        radius: formData.radius * 1000,
        isActive: formData.isActive,
        boundaries: drawnShape ? [drawnShape] : formData.boundaries,
      };

      // Only add center if it's not null
      if (formData.center) {
        payload.center = formData.center;
      }

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

  const handleDrawCreated = (layer: any) => {
    setDrawnShape(layer);
    
    // Update center and radius based on drawn shape
    if (layer.type === 'circle') {
      setFormData({
        ...formData,
        center: { latitude: layer.center[0], longitude: layer.center[1] },
        radius: layer.radius / 1000,
      });
    } else if (layer.type === 'polygon' && layer.points.length > 0) {
      // Calculate center of polygon
      const lats = layer.points.map((p: number[]) => p[0]);
      const lngs = layer.points.map((p: number[]) => p[1]);
      const centerLat = lats.reduce((a: number, b: number) => a + b, 0) / lats.length;
      const centerLng = lngs.reduce((a: number, b: number) => a + b, 0) / lngs.length;
      
      setFormData({
        ...formData,
        center: { latitude: centerLat, longitude: centerLng },
      });
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
              📍 Define Coverage Boundaries
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden">
              <Map
                height="350px"
                zoom={6}
                center={formData.center ? [formData.center.latitude, formData.center.longitude] : [9.0820, 8.6753]}
                enableDrawing={true}
                onDrawCreated={handleDrawCreated}
                circles={drawnShape?.type === 'circle' ? [{
                  center: drawnShape.center,
                  radius: drawnShape.radius,
                  color: '#ef4444',
                }] : []}
              />
            </div>
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-700 flex items-start gap-2">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Use the drawing tools on the map to define your coverage area. You can draw a circle, polygon, or rectangle to mark your service zone.</span>
              </p>
            </div>
            {drawnShape && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Coverage area defined: {drawnShape.type === 'circle' ? `${(drawnShape.radius / 1000).toFixed(1)} km radius` : 'Custom polygon'}
                </p>
              </div>
            )}
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
