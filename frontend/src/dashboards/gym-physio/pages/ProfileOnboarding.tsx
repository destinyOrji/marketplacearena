import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiSave } from 'react-icons/fi';
import { getProfile, updateProfile, uploadPhoto, changePassword } from '../services/api';

const ProfileOnboarding: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const [form, setForm] = useState({
    businessName: '', businessType: '', specialization: '',
    licenseNumber: '', yearsInBusiness: 0, phone: '',
    bio: '', city: '', state: '', address: '', membershipFee: 0,
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const d = await getProfile();
      setForm({
        businessName: d.businessName || '',
        businessType: d.businessType || '',
        specialization: d.specialization || '',
        licenseNumber: d.licenseNumber || '',
        yearsInBusiness: d.yearsInBusiness || 0,
        phone: d.phone || '',
        bio: (d as any).bio || '',
        city: d.city || '',
        state: d.state || '',
        address: (d as any).address || '',
        membershipFee: d.membershipFee || 0,
      });
      setIsVerified(d.isVerified || false);
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form as any);
      toast.success('Profile updated successfully');
    } catch (e: any) {
      toast.error(e.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await changePassword(passwords.currentPassword, passwords.newPassword);
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
    try {
      await uploadPhoto(file);
      toast.success('Photo uploaded');
      loadProfile();
    } catch {
      toast.error('Failed to upload photo');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
    </div>
  );

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-2xl font-bold">
            {form.businessName?.[0] || 'G'}
          </div>
          <label className="absolute bottom-0 right-0 bg-orange-600 text-white rounded-full p-1 cursor-pointer hover:bg-orange-700 text-xs">
            📷
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </label>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{form.businessName || 'My Business'}</h1>
          <p className="text-gray-500 text-sm capitalize">{form.businessType}</p>
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
              className={`px-6 py-4 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === tab ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Business Name</label>
                  <input className={inputClass} value={form.businessName} onChange={e => setForm(p => ({ ...p, businessName: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass}>Business Type</label>
                  <select className={inputClass} value={form.businessType} onChange={e => setForm(p => ({ ...p, businessType: e.target.value }))}>
                    <option value="">Select type</option>
                    <option value="gym">Gym</option>
                    <option value="physiotherapy">Physiotherapy</option>
                    <option value="both">Both</option>
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
                  <label className={labelClass}>Years in Business</label>
                  <input type="number" min="0" className={inputClass} value={form.yearsInBusiness}
                    onChange={e => setForm(p => ({ ...p, yearsInBusiness: parseInt(e.target.value) || 0 }))} />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input className={inputClass} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass}>Membership Fee (₦)</label>
                  <input type="number" min="0" className={inputClass} value={form.membershipFee}
                    onChange={e => setForm(p => ({ ...p, membershipFee: parseFloat(e.target.value) || 0 }))} />
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
                  <label className={labelClass}>Address</label>
                  <input className={inputClass} value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Bio / Description</label>
                  <textarea rows={4} className={inputClass} value={form.bio}
                    onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50">
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
                  className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50">
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
