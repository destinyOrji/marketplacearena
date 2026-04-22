import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiSave, FiUpload, FiLock, FiCamera } from 'react-icons/fi';
import { useHospital } from '../contexts/HospitalContext';
import { hospitalApi } from '../services/api';

const Profile: React.FC = () => {
  const { hospital, updateHospital, loading } = useHospital();
  const [activeTab, setActiveTab] = useState<'basic' | 'contact' | 'facilities' | 'password'>('basic');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    hospitalName: '',
    hospitalType: '',
    registrationNumber: '',
    totalBeds: 0,
    availableBeds: 0,
    icuBeds: 0,
    emergencyServices: false,
    description: '',
    phone: '',
    email: '',
    website: '',
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });

  useEffect(() => {
    if (hospital) {
      setForm({
        hospitalName: hospital.hospitalName || '',
        hospitalType: hospital.hospitalType || '',
        registrationNumber: hospital.registrationNumber || '',
        totalBeds: hospital.totalBeds || 0,
        availableBeds: hospital.availableBeds || 0,
        icuBeds: hospital.icuBeds || 0,
        emergencyServices: hospital.emergencyServices || false,
        description: (hospital as any).description || '',
        phone: hospital.phone || '',
        email: hospital.email || '',
        website: hospital.website || '',
        street: hospital.address?.street || '',
        city: hospital.address?.city || '',
        state: hospital.address?.state || '',
        country: hospital.address?.country || '',
        zipCode: hospital.address?.zipCode || '',
      });
    }
  }, [hospital]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateHospital({
        hospitalName: form.hospitalName,
        hospitalType: form.hospitalType,
        totalBeds: form.totalBeds,
        availableBeds: form.availableBeds,
        icuBeds: form.icuBeds,
        emergencyServices: form.emergencyServices,
        phone: form.phone,
        email: form.email,
        website: form.website,
        address: {
          street: form.street,
          city: form.city,
          state: form.state,
          country: form.country,
          zipCode: form.zipCode,
        },
      } as any);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
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
      await hospitalApi.changePassword(passwords.currentPassword, passwords.newPassword);
      toast.success('Password changed successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await hospitalApi.uploadImage(file, 'logo');
      toast.success('Logo uploaded successfully');
      window.location.reload();
    } catch (error: any) {
      toast.error('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  if (loading || !hospital) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-6">
        <div className="relative">
          {(hospital as any).logo ? (
            <img src={(hospital as any).logo} alt="Logo" className="w-20 h-20 rounded-xl object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
              {form.hospitalName?.[0] || 'H'}
            </div>
          )}
          <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 cursor-pointer hover:bg-blue-700">
            <FiCamera size={12} />
            <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
          </label>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{form.hospitalName || 'Hospital Profile'}</h1>
          <p className="text-gray-500 text-sm capitalize">{form.hospitalType}</p>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${hospital.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {hospital.isVerified ? '✓ Verified' : 'Pending Verification'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-200 flex overflow-x-auto">
          {(['basic', 'contact', 'facilities', 'password'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-medium capitalize whitespace-nowrap border-b-2 transition-colors ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {tab === 'basic' ? 'Basic Info' : tab === 'facilities' ? 'Facilities & Beds' : tab}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Basic Info */}
          {activeTab === 'basic' && (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Hospital Name</label>
                  <input className={inputClass} value={form.hospitalName} onChange={e => setForm(p => ({ ...p, hospitalName: e.target.value }))} required />
                </div>
                <div>
                  <label className={labelClass}>Registration Number</label>
                  <input className={inputClass} value={form.registrationNumber} disabled />
                </div>
                <div>
                  <label className={labelClass}>Hospital Type</label>
                  <select className={inputClass} value={form.hospitalType} onChange={e => setForm(p => ({ ...p, hospitalType: e.target.value }))}>
                    <option value="">Select type</option>
                    <option value="General Hospital">General Hospital</option>
                    <option value="Specialist Hospital">Specialist Hospital</option>
                    <option value="Teaching Hospital">Teaching Hospital</option>
                    <option value="Private Hospital">Private Hospital</option>
                    <option value="Clinic">Clinic</option>
                    <option value="Medical Center">Medical Center</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <input type="checkbox" id="emergency" checked={form.emergencyServices}
                    onChange={e => setForm(p => ({ ...p, emergencyServices: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded" />
                  <label htmlFor="emergency" className="text-sm font-medium text-gray-700">Emergency Services Available</label>
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Description</label>
                  <textarea rows={4} className={inputClass} value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Tell patients about your hospital..." />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  <FiSave size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {/* Contact */}
          {activeTab === 'contact' && (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Phone</label>
                  <input className={inputClass} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input type="email" className={inputClass} value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Website</label>
                  <input className={inputClass} value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} placeholder="https://" />
                </div>
                <div className="md:col-span-2">
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
                <div>
                  <label className={labelClass}>Zip Code</label>
                  <input className={inputClass} value={form.zipCode} onChange={e => setForm(p => ({ ...p, zipCode: e.target.value }))} />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  <FiSave size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {/* Facilities & Beds */}
          {activeTab === 'facilities' && (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Total Beds</label>
                  <input type="number" min="0" className={inputClass} value={form.totalBeds}
                    onChange={e => setForm(p => ({ ...p, totalBeds: parseInt(e.target.value) || 0 }))} />
                </div>
                <div>
                  <label className={labelClass}>Available Beds</label>
                  <input type="number" min="0" className={inputClass} value={form.availableBeds}
                    onChange={e => setForm(p => ({ ...p, availableBeds: parseInt(e.target.value) || 0 }))} />
                </div>
                <div>
                  <label className={labelClass}>ICU Beds</label>
                  <input type="number" min="0" className={inputClass} value={form.icuBeds}
                    onChange={e => setForm(p => ({ ...p, icuBeds: parseInt(e.target.value) || 0 }))} />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  <FiSave size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {/* Password */}
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
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
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

export default Profile;
