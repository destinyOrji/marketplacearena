import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiSave, FiCamera, FiLock } from 'react-icons/fi';
import apiClient from '../services/apiClient';

const ProfileOnboarding: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    specialization: '', licenseNumber: '', yearsOfExperience: 0,
    professionalType: '', bio: '', city: '', state: '', address: '',
    consultationFee: 0,
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/professionals/profile');
      const d = res.data?.data || res.data;
      setForm({
        firstName: d.user?.firstName || d.firstName || '',
        lastName: d.user?.lastName || d.lastName || '',
        email: d.user?.email || d.email || '',
        phone: d.phone || '',
        specialization: d.specialization || '',
        licenseNumber: d.licenseNumber || '',
        yearsOfExperience: d.yearsOfExperience || 0,
        professionalType: d.professionalType || '',
        bio: d.bio || '',
        city: d.city || '',
        state: d.state || '',
        address: d.address || '',
        consultationFee: d.consultationFee || 0,
      });
    } catch (e) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.put('/professionals/profile/update', form);
      toast.success('Profile updated successfully');
    } catch (e: any) {
      toast.error(e.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await apiClient.put('/professionals/profile/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e: any) {
      toast.error(e.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('photo', file);
    try {
      await apiClient.post('/professionals/upload-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Photo uploaded');
      loadProfile();
    } catch {
      toast.error('Failed to upload photo');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-2xl font-bold">
            {form.firstName?.[0]}{form.lastName?.[0]}
          </div>
          <label className="absolute bottom-0 right-0 bg-green-600 text-white rounded-full p-1 cursor-pointer hover:bg-green-700">
            <FiCamera size={12} />
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </label>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{form.firstName} {form.lastName}</h1>
          <p className="text-gray-500 text-sm">{form.email}</p>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1 capitalize">
            {form.professionalType || 'Professional'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-200 flex">
          {(['profile', 'password'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === tab ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>First Name</label>
                  <input className={inputClass} value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass}>Last Name</label>
                  <input className={inputClass} value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input className={inputClass} value={form.email} disabled />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input className={inputClass} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass}>Professional Type</label>
                  <select className={inputClass} value={form.professionalType} onChange={e => setForm(p => ({ ...p, professionalType: e.target.value }))}>
                    <option value="">Select type</option>
                    {['doctor','nurse','technician','therapist','pharmacist','physiotherapist','other'].map(t => (
                      <option key={t} value={t} className="capitalize">{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Specialization</label>
                  <input className={inputClass} value={form.specialization} onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass}>License Number</label>
                  <input className={inputClass} value={form.licenseNumber} onChange={e => setForm(p => ({ ...p, licenseNumber: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass}>Years of Experience</label>
                  <input type="number" min="0" className={inputClass} value={form.yearsOfExperience} onChange={e => setForm(p => ({ ...p, yearsOfExperience: parseInt(e.target.value) || 0 }))} />
                </div>
                <div>
                  <label className={labelClass}>Consultation Fee (₦)</label>
                  <input type="number" min="0" className={inputClass} value={form.consultationFee} onChange={e => setForm(p => ({ ...p, consultationFee: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div>
                  <label className={labelClass}>City</label>
                  <input className={inputClass} value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass}>State</label>
                  <input className={inputClass} value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Bio</label>
                  <textarea rows={4} className={inputClass} value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} placeholder="Tell patients about yourself..." />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                  <FiSave size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div>
                <label className={labelClass}>Current Password</label>
                <input type="password" className={inputClass} value={passwords.currentPassword}
                  onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>New Password</label>
                <input type="password" className={inputClass} value={passwords.newPassword}
                  onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>Confirm New Password</label>
                <input type="password" className={inputClass} value={passwords.confirmPassword}
                  onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))} />
              </div>
              <div className="flex justify-end pt-4">
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                  <FiLock size={16} /> {saving ? 'Saving...' : 'Change Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileOnboarding;
