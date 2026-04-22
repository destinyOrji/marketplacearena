import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiSave } from 'react-icons/fi';
import apiClient from '../services/apiClient';

const ProfileOnboarding: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const [form, setForm] = useState({
    serviceName: '', serviceType: '', phone: '', emergencyNumber: '',
    email: '', licenseNumber: '', yearsOfExperience: 0,
    street: '', city: '', state: '', country: '',
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/ambulance/profile');
      const d = res.data?.data || res.data;
      setForm({
        serviceName: d.serviceName || '',
        serviceType: d.serviceType || '',
        phone: d.phone || '',
        emergencyNumber: d.emergencyNumber || '',
        email: d.email || d.user?.email || '',
        licenseNumber: d.licenseNumber || '',
        yearsOfExperience: d.yearsOfExperience || 0,
        street: d.baseAddress?.street || '',
        city: d.baseAddress?.city || '',
        state: d.baseAddress?.state || '',
        country: d.baseAddress?.country || '',
      });
      setIsVerified(d.isVerified || false);
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
      await apiClient.put('/ambulance/profile/update', {
        serviceName: form.serviceName,
        serviceType: form.serviceType,
        phone: form.phone,
        emergencyNumber: form.emergencyNumber,
        email: form.email,
        licenseNumber: form.licenseNumber,
        yearsOfExperience: form.yearsOfExperience,
        baseAddress: { street: form.street, city: form.city, state: form.state, country: form.country },
      });
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
      await apiClient.post('/ambulance/change-password', {
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

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
    </div>
  );

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-2xl font-bold">
          {form.serviceName?.[0] || 'A'}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{form.serviceName || 'Ambulance Service'}</h1>
          <p className="text-gray-500 text-sm">{form.email}</p>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {isVerified ? '✓ Verified' : 'Pending Verification'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-200 flex">
          {(['profile', 'password'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === tab ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Service Name</label>
                  <input className={inputClass} value={form.serviceName} onChange={e => setForm(p => ({ ...p, serviceName: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass}>Service Type</label>
                  <select className={inputClass} value={form.serviceType} onChange={e => setForm(p => ({ ...p, serviceType: e.target.value }))}>
                    <option value="">Select type</option>
                    <option value="Basic Life Support (BLS)">Basic Life Support (BLS)</option>
                    <option value="Advanced Life Support (ALS)">Advanced Life Support (ALS)</option>
                    <option value="Critical Care Transport">Critical Care Transport</option>
                    <option value="Patient Transport">Patient Transport</option>
                    <option value="Air Ambulance">Air Ambulance</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input className={inputClass} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass}>Emergency Number</label>
                  <input className={inputClass} value={form.emergencyNumber} onChange={e => setForm(p => ({ ...p, emergencyNumber: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input className={inputClass} value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass}>License Number</label>
                  <input className={inputClass} value={form.licenseNumber} onChange={e => setForm(p => ({ ...p, licenseNumber: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass}>Street Address</label>
                  <input className={inputClass} value={form.street} onChange={e => setForm(p => ({ ...p, street: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass}>City</label>
                  <input className={inputClass} value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass}>State</label>
                  <input className={inputClass} value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass}>Country</label>
                  <input className={inputClass} value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                  <FiSave className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
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
                  className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                  🔒 {saving ? 'Saving...' : 'Change Password'}
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
