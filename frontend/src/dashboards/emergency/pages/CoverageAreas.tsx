// Coverage Areas Page
import React, { useState, useEffect } from 'react';
import { CoverageZone } from '../types';
import { coverageApi } from '../services/api';
import Map from '../../../components/Map';

// ─── Main Page ────────────────────────────────────────────────────────────────

const CoverageAreas: React.FC = () => {
  const [coverageAreas, setCoverageAreas] = useState<CoverageZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedArea, setSelectedArea] = useState<CoverageZone | null>(null);

  useEffect(() => { fetchCoverageAreas(); }, []);

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

  const handleAddArea = () => { setSelectedArea(null); setShowModal(true); };
  const handleEditArea = (area: CoverageZone) => { setSelectedArea(area); setShowModal(true); };

  const handleDeleteArea = async (id: string) => {
    if (!window.confirm('Delete this coverage area?')) return;
    try {
      await coverageApi.deleteCoverageArea(id);
      setCoverageAreas(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting coverage area:', error);
    }
  };

  const handleToggleActive = async (area: CoverageZone) => {
    try {
      const updated = await coverageApi.updateCoverageArea(area.id, { isActive: !area.isActive });
      setCoverageAreas(prev => prev.map(a => a.id === area.id ? updated : a));
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coverage Areas</h1>
          <p className="text-sm text-gray-500 mt-1">Define where you provide ambulance services</p>
        </div>
        <button
          onClick={handleAddArea}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg"
        >
          + Add Coverage Area
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map View */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative z-[1]">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              🗺️ Coverage Map
            </h2>
            <p className="text-sm text-gray-600 mt-1">Active coverage areas shown as red circles</p>
          </div>
          <div className="p-4">
            <Map
              height="450px"
              center={[9.0820, 8.6753]}
              zoom={6}
              circles={coverageAreas
                .filter(a => a.isActive)
                .map(a => ({
                  center: a.center ? [a.center.latitude, a.center.longitude] as [number, number] : [9.0820, 8.6753] as [number, number],
                  radius: a.radius || 5000,
                  color: '#ef4444',
                }))}
            />
            <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full opacity-40 border-2 border-red-500 inline-block"></span>
                Active Coverage Zones
              </div>
              <span>{coverageAreas.filter(a => a.isActive).length} active</span>
            </div>
          </div>
        </div>

        {/* Coverage Areas List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative z-[2]">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              📍 Coverage Zones
            </h2>
            <p className="text-sm text-gray-600 mt-1">Manage your service areas</p>
          </div>

          <div className="p-4">
            {coverageAreas.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">No coverage areas yet</h3>
                <p className="text-gray-500 mb-4 text-sm">Add your first coverage area to start receiving bookings</p>
                <button
                  onClick={handleAddArea}
                  className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  + Add Coverage Area
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                {coverageAreas.map((area) => (
                  <div key={area.id} className="border border-gray-200 rounded-xl p-4 hover:border-red-200 transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{area.name}</h3>
                          <button
                            onClick={() => handleToggleActive(area)}
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              area.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {area.isActive ? '✓ Active' : 'Inactive'}
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {area.serviceTypes.map((type, i) => (
                            <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100">
                              {type}
                            </span>
                          ))}
                        </div>
                        {area.radius && (
                          <p className="text-sm text-gray-500">
                            📏 Radius: <strong>{(area.radius / 1000).toFixed(1)} km</strong>
                            {' '}· Area: ~{(Math.PI * Math.pow(area.radius / 1000, 2)).toFixed(0)} km²
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleEditArea(area)}
                        className="flex-1 px-3 py-1.5 bg-white text-gray-700 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteArea(area.id)}
                        className="flex-1 px-3 py-1.5 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <CoverageAreaModal
          area={selectedArea}
          onClose={() => setShowModal(false)}
          onSave={(area) => {
            if (selectedArea) {
              setCoverageAreas(prev => prev.map(a => a.id === area.id ? area : a));
            } else {
              setCoverageAreas(prev => [...prev, area]);
            }
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
};

// ─── Modal ────────────────────────────────────────────────────────────────────

interface CoverageAreaModalProps {
  area: CoverageZone | null;
  onClose: () => void;
  onSave: (area: CoverageZone) => void;
}

const CoverageAreaModal: React.FC<CoverageAreaModalProps> = ({ area, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: area?.name || '',
    serviceTypes: area?.serviceTypes || [] as string[],
    radius: area?.radius ? area.radius / 1000 : 5,
    isActive: area?.isActive ?? true,
    center: area?.center || null as { latitude: number; longitude: number } | null,
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number]>(
    area?.center ? [area.center.latitude, area.center.longitude] : [9.0820, 8.6753]
  );
  const [mapZoom, setMapZoom] = useState(area?.center ? 11 : 6);

  const serviceTypeOptions = ['ambulance', 'paramedic', 'fire', 'rescue', 'medical-transport'];

  // Geocode place name → coordinates using OpenStreetMap (free, no API key)
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setError('');
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Nigeria')}&limit=1`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      const results = await res.json();

      if (results && results.length > 0) {
        const { lat, lon, display_name } = results[0];
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        setFormData(prev => ({
          ...prev,
          center: { latitude, longitude },
          name: prev.name || display_name.split(',')[0].trim(),
        }));
        setMapCenter([latitude, longitude]);
        setMapZoom(12);
      } else {
        setError('Location not found. Try a different name e.g. "Ikeja Lagos" or "Victoria Island Lagos"');
      }
    } catch {
      setError('Search failed. Please check your internet connection.');
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.center) { setError('Please search and select a location first.'); return; }
    if (formData.serviceTypes.length === 0) { setError('Please select at least one service type.'); return; }

    setLoading(true);
    try {
      const payload: any = {
        name: formData.name,
        serviceTypes: formData.serviceTypes,
        radius: Math.round(formData.radius * 1000),
        isActive: formData.isActive,
        center: formData.center,
        boundaries: [],
      };
      const result = area
        ? await coverageApi.updateCoverageArea(area.id, payload)
        : await coverageApi.createCoverageArea(payload);
      onSave(result);
    } catch (err: any) {
      setError(err?.message || 'Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleService = (type: string) => {
    setFormData(prev => ({
      ...prev,
      serviceTypes: prev.serviceTypes.includes(type)
        ? prev.serviceTypes.filter(t => t !== type)
        : [...prev.serviceTypes, type],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[95vh] overflow-y-auto">

        {/* Header */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">
            {area ? 'Edit Coverage Area' : 'Add Coverage Area'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Step 1: Search Location */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <label className="block text-sm font-semibold text-blue-900 mb-2">
              Step 1 — Search for a location
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
                className="flex-1 px-3 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                placeholder="e.g. Ikeja, Lekki, Surulere, Kano..."
              />
              <button
                type="button"
                onClick={handleSearch}
                disabled={searching || !searchQuery.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
              >
                {searching ? '⏳' : '🔍 Search'}
              </button>
            </div>
            {formData.center && (
              <p className="mt-2 text-xs text-green-700 font-medium">
                ✅ Location found: {formData.center.latitude.toFixed(4)}°N, {formData.center.longitude.toFixed(4)}°E
              </p>
            )}
          </div>

          {/* Step 2: Area Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Step 2 — Area Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="e.g. Ikeja Zone, Lagos Mainland, Surulere Area"
              required
            />
          </div>

          {/* Step 3: Radius slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 3 — Coverage Radius: <strong className="text-red-600">{formData.radius} km</strong>
              <span className="text-gray-400 font-normal ml-2">
                (~{(Math.PI * formData.radius * formData.radius).toFixed(0)} km² area)
              </span>
            </label>
            <input
              type="range"
              min="1" max="100" step="1"
              value={formData.radius}
              onChange={e => setFormData(prev => ({ ...prev, radius: parseFloat(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1 km</span><span>25 km</span><span>50 km</span><span>75 km</span><span>100 km</span>
            </div>
          </div>

          {/* Map Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 4 — Preview on Map
            </label>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <Map
                height="280px"
                zoom={mapZoom}
                center={mapCenter}
                circles={formData.center ? [{
                  center: [formData.center.latitude, formData.center.longitude] as [number, number],
                  radius: formData.radius * 1000,
                  color: '#ef4444',
                }] : []}
              />
            </div>
            {!formData.center && (
              <p className="mt-2 text-xs text-gray-400 text-center italic">
                Search for a location above to see the coverage circle on the map
              </p>
            )}
          </div>

          {/* Service Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 5 — Service Types *
            </label>
            <div className="flex flex-wrap gap-2">
              {serviceTypeOptions.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleService(type)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
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

          {/* Active toggle */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="w-4 h-4 text-red-600 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Activate this coverage area immediately
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.center}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold text-sm disabled:opacity-50"
            >
              {loading ? 'Saving...' : area ? 'Update Area' : '+ Add Coverage Area'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CoverageAreas;
