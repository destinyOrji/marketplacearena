import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import { toast } from 'react-toastify';

interface Service {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  basePrice: number;
  pricePerKm: number;
  currency: string;
  isActive: boolean;
}

const defaultForm = { name: '', description: '', basePrice: 0, pricePerKm: 0, currency: 'NGN', isActive: true };

const MyServices: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/ambulance/services');
      setServices(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch { toast.error('Failed to load services'); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setEditing(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = (s: Service) => { setEditing(s); setForm({ name: s.name, description: s.description, basePrice: s.basePrice, pricePerKm: s.pricePerKm, currency: s.currency, isActive: s.isActive }); setShowModal(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Service name is required'); return; }
    setSaving(true);
    try {
      if (editing) {
        const id = editing._id || editing.id;
        await apiClient.put(`/ambulance/services/${id}/update`, form);
        setServices(prev => prev.map(s => (s._id || s.id) === id ? { ...s, ...form } : s));
        toast.success('Service updated');
      } else {
        const res = await apiClient.post('/ambulance/services/add', form);
        const newServices = res.data?.data;
        if (Array.isArray(newServices)) {
          setServices(newServices);
        } else {
          await fetchServices();
        }
        toast.success('Service added');
      }
      setShowModal(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save service');
    } finally { setSaving(false); }
  };

  const handleDelete = async (s: Service) => {
    if (!window.confirm(`Delete "${s.name}"?`)) return;
    const id = s._id || s.id;
    try {
      await apiClient.delete(`/ambulance/services/${id}/delete`);
      setServices(prev => prev.filter(x => (x._id || x.id) !== id));
      toast.success('Service deleted');
    } catch { toast.error('Failed to delete service'); }
  };

  const handleToggle = async (s: Service) => {
    const id = s._id || s.id;
    try {
      await apiClient.put(`/ambulance/services/${id}/update`, { isActive: !s.isActive });
      setServices(prev => prev.map(x => (x._id || x.id) === id ? { ...x, isActive: !s.isActive } : x));
    } catch { toast.error('Failed to update service'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Services</h1>
        <button onClick={openAdd} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          + Add Service
        </button>
      </div>

      {services.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-5xl mb-3">🚑</p>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No services yet</h3>
          <p className="text-gray-500 text-sm mb-4">Add the emergency services you offer to patients</p>
          <button onClick={openAdd} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Add First Service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s: Service) => (
            <div key={s._id || s.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{s.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{s.description || 'No description'}</p>
                </div>
                <button onClick={() => handleToggle(s)}
                  className={`ml-2 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {s.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>

              <div className="space-y-1 text-sm text-gray-600 mb-4">
                <div className="flex justify-between">
                  <span>Base Price</span>
                  <span className="font-semibold text-gray-900">{s.currency} {(s.basePrice || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Per KM</span>
                  <span className="font-semibold text-gray-900">{s.currency} {(s.pricePerKm || 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => openEdit(s)}
                  className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
                  Edit
                </button>
                <button onClick={() => handleDelete(s)}
                  className="flex-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{editing ? 'Edit Service' : 'Add Service'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Name *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., Basic Life Support" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows={3} placeholder="Describe this service..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Price</label>
                  <input type="number" value={form.basePrice} onChange={e => setForm({ ...form, basePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    min={0} step={100} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price per KM</label>
                  <input type="number" value={form.pricePerKm} onChange={e => setForm({ ...form, pricePerKm: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    min={0} step={10} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                  <option value="NGN">NGN (₦)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="svcActive" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded" />
                <label htmlFor="svcActive" className="text-sm text-gray-700">Active (visible to patients)</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} disabled={saving}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                  {saving ? 'Saving...' : editing ? 'Update' : 'Add Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyServices;
