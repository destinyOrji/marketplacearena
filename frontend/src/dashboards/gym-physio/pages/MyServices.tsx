import React, { useEffect, useState } from 'react';
import { getServices, createService, updateService, deleteService, uploadDocument } from '../services/api';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'https://healthmarketarena.com';

const MyServices: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '', description: '', price: 0, duration: 60,
    category: 'fitness', status: 'active', images: [] as string[]
  });

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await getServices();
      setServices(Array.isArray(data) ? data : []);
    } catch { toast.error('Failed to load services'); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', description: '', price: 0, duration: 60, category: 'fitness', status: 'active', images: [] });
    setImageFile(null);
    setImagePreview(null);
    setShowModal(true);
  };

  const openEdit = (s: any) => {
    setEditing(s);
    setForm({
      title: s.title, description: s.description, price: s.price,
      duration: s.duration, category: s.category || 'fitness',
      status: s.status, images: s.images || []
    });
    setImageFile(null);
    setImagePreview(s.images?.[0] ? `${API_URL}${s.images[0]}` : null);
    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let images = form.images;

      // Upload image if selected
      if (imageFile) {
        try {
          const result = await uploadDocument(imageFile);
          const url = (result as any).documentUrl || (result as any).photoUrl || '';
          if (url) images = [url];
        } catch {
          toast.warning('Image upload failed, saving without image');
        }
      }

      const payload = { ...form, images } as any;

      if (editing) {
        await updateService(editing._id || editing.id, payload);
        toast.success('Service updated');
      } else {
        await createService(payload);
        toast.success('Service created');
      }
      setShowModal(false);
      fetchServices();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save service');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await deleteService(id);
      toast.success('Service deleted');
      fetchServices();
    } catch { toast.error('Failed to delete service'); }
  };

  const getImageUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_URL}${path}`;
  };

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm";

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Services</h1>
        <button onClick={openCreate} className="px-5 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium">
          + Add Service
        </button>
      </div>

      {services.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-5xl mb-3">💪</p>
          <p className="text-gray-600 mb-4">No services yet</p>
          <button onClick={openCreate} className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm">
            Create Your First Service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s: any) => {
            const id = s._id || s.id;
            const imgUrl = getImageUrl(s.images?.[0]);
            return (
              <div key={id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Image */}
                <div className="h-40 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center overflow-hidden">
                  {imgUrl ? (
                    <img src={imgUrl} alt={s.title} className="w-full h-full object-cover"
                      onError={e => { e.currentTarget.style.display = 'none'; }} />
                  ) : (
                    <span className="text-5xl">💪</span>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-base font-bold text-gray-900">{s.title}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${s.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {s.status}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2">{s.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-orange-600">₦{(s.price || 0).toLocaleString()}</span>
                    <span className="text-sm text-gray-500">{s.duration} min</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(s)} className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(id)} className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{editing ? 'Edit Service' : 'Create Service'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-400 transition-colors">
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg mb-2" />
                      <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="py-4">
                      <p className="text-4xl mb-2">📷</p>
                      <p className="text-sm text-gray-500">Click to upload image</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="service-image" />
                  <label htmlFor="service-image" className="cursor-pointer text-sm text-orange-600 hover:text-orange-700 font-medium">
                    {imagePreview ? 'Change Image' : 'Select Image'}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input className={inputClass} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={3} className={inputClass} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦)</label>
                  <input type="number" min="0" className={inputClass} value={form.price} onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                  <input type="number" min="15" className={inputClass} value={form.duration} onChange={e => setForm(p => ({ ...p, duration: Number(e.target.value) }))} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select className={inputClass} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  <option value="fitness">Fitness</option>
                  <option value="physiotherapy">Physiotherapy</option>
                  <option value="yoga">Yoga</option>
                  <option value="massage">Massage</option>
                  <option value="nutrition">Nutrition</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select className={inputClass} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  <option value="active">Active (visible to patients)</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 text-sm">
                  {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
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
