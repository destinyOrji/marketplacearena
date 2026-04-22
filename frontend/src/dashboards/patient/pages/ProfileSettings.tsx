import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { patientApi } from '../services/api';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import { FiSave } from 'react-icons/fi';

const ProfileSettings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'emergency'>('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    dateOfBirth: '', gender: '', address: '', city: '', state: '',
    bloodGroup: '', maritalStatus: '',
  });

  const [emergency, setEmergency] = useState({
    name: '', phone: '', relationship: '', email: '',
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await patientApi.getProfile();
      const d = (res as any).data?.data || (res as any).data || res;
      setForm({
        firstName: d.firstName || '',
        lastName: d.lastName || '',
        email: d.email || '',
        phone: d.phone || '',
        dateOfBirth: d.dateOfBirth
          ? (typeof d.dateOfBirth === 'string' ? d.dateOfBirth.split('T')[0] : new Date(d.dateOfBirth).toISOString().split('T')[0])
          : '',
        gender: d.gender || '',
        address: (typeof d.address === 'object' ? d.address?.street : d.address) || '',
        city: (typeof d.address === 'object' ? d.address?.city : '') || d.city || '',
        state: (typeof d.address === 'object' ? d.address?.state : '') || d.state || '',
        bloodGroup: d.bloodGroup || '',
        maritalStatus: d.maritalStatus || '',
      });
      setEmergency({
        name: d.emergencyContact?.name || '',
        phone: d.emergencyContact?.phone || '',
        relationship: d.emergencyContact?.relationship || '',
        email: d.emergencyContact?.email || '',
      });
    } catch {
      showErrorToast('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await patientApi.updateProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender as any,
        address: { street: form.address, city: form.city, state: form.state } as any,
        bloodGroup: form.bloodGroup as any,
        maritalStatus: form.maritalStatus as any,
        emergencyContact: emergency as any,
      } as any);
      showSuccessToast('Profile updated successfully');
      if (updateUser) updateUser({ ...user, ...form } as any);
    } catch (e: any) {
      showErrorToast(e.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      showErrorToast('Passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await patientApi.changePassword(passwords.currentPassword, passwords.newPassword);
      showSuccessToast('Password changed successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e: any) {
      showErrorToast(e.message || 'Failed to change password');
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
      await patientApi.uploadPhoto(formData);
      showSuccessToast('Photo uploaded successfully');
      loadProfile();
    } catch {
      showErrorToast('Failed to upload photo');
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
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
            {form.firstName?.[0]}{form.lastName?.[0]}
          </div>
          <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 cursor-pointer hover:bg-blue-700 text-xs">
            📷
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </label>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{form.firstName} {form.lastName}</h1>
          <p className="text-gray-500 text-sm">{form.email}</p>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">Patient</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-200 flex">
          {(['profile', 'emergency', 'password'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {tab === 'emergency' ? 'Emergency Contact' : tab}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
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
                  <input className={`${inputClass} bg-gray-50`} value={form.email} disabled />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input className={inputClass} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass}>Date of Birth</label>
                  <input type="date" className={inputClass} value={form.dateOfBirth} onChange={e => setForm(p => ({ ...p, dateOfBirth: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass}>Gender</label>
                  <select className={inputClass} value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}>
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Blood Group</label>
                  <select className={inputClass} value={form.bloodGroup} onChange={e => setForm(p => ({ ...p, bloodGroup: e.target.value }))}>
                    <option value="">Select blood group</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Marital Status</label>
                  <select className={inputClass} value={form.maritalStatus} onChange={e => setForm(p => ({ ...p, maritalStatus: e.target.value }))}>
                    <option value="">Select status</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Street Address</label>
                  <input className={inputClass} value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Street address" />
                </div>
                <div>
                  <label className={labelClass}>City</label>
                  <input className={inputClass} value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass}>State</label>
                  <input className={inputClass} value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  <FiSave className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'emergency' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <p className="text-sm text-gray-500 mb-4">This person will be contacted in case of emergency.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Contact Name</label>
                  <input className={inputClass} value={emergency.name} onChange={e => setEmergency(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass}>Relationship</label>
                  <input className={inputClass} value={emergency.relationship} onChange={e => setEmergency(p => ({ ...p, relationship: e.target.value }))} placeholder="e.g. Spouse, Parent" />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input className={inputClass} value={emergency.phone} onChange={e => setEmergency(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input className={inputClass} value={emergency.email} onChange={e => setEmergency(p => ({ ...p, email: e.target.value }))} />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
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
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
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

export default ProfileSettings;
