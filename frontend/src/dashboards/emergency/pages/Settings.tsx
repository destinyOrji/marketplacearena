import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import { toast } from 'react-toastify';

const Settings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [operatingHours, setOperatingHours] = useState<any>({ is24x7: true, schedule: {} });
  const [notifications, setNotifications] = useState({ push: true, sms: true, email: true, sound: true });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPassword, setChangingPassword] = useState(false);
  const [contactInfo, setContactInfo] = useState({ phone: '', email: '', emergencyNumber: '' });
  const [updatingContact, setUpdatingContact] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [settingsRes, profileRes] = await Promise.all([
        apiClient.get('/ambulance/settings').catch(() => ({ data: {} })),
        apiClient.get('/ambulance/profile').catch(() => ({ data: {} })),
      ]);
      const s = settingsRes.data?.data || settingsRes.data || {};
      const p = profileRes.data?.data || profileRes.data || {};
      setIsAvailable(s.isAvailable ?? false);
      setOperatingHours(s.operatingHours || { is24x7: true, schedule: {} });
      setContactInfo({ phone: p.phone || '', email: p.email || '', emergencyNumber: p.emergencyNumber || '' });
    } catch { toast.error('Failed to load settings'); }
    finally { setLoading(false); }
  };

  const handleSaveAvailability = async () => {
    setSaving(true);
    try {
      await apiClient.put('/ambulance/settings/update', { isAvailable, operatingHours });
      toast.success('Availability settings saved');
    } catch { toast.error('Failed to save settings'); }
    finally { setSaving(false); }
  };

  const handleContactUpdate = async () => {
    if (!contactInfo.phone || !contactInfo.email) { toast.error('Phone and email are required'); return; }
    setUpdatingContact(true);
    try {
      await apiClient.put('/ambulance/profile/update', contactInfo);
      toast.success('Contact information updated');
    } catch { toast.error('Failed to update contact info'); }
    finally { setUpdatingContact(false); }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (passwordData.newPassword !== passwordData.confirmPassword) { toast.error('Passwords do not match'); return; }
    setChangingPassword(true);
    try {
      await apiClient.post('/ambulance/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    } finally { setChangingPassword(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
    </div>
  );

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {/* Availability */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Availability</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">Service Available</p>
              <p className="text-sm text-gray-500">Toggle to accept or pause emergency bookings</p>
            </div>
            <button onClick={() => setIsAvailable(!isAvailable)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isAvailable ? 'bg-red-600' : 'bg-gray-200'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">24/7 Operations</p>
              <p className="text-sm text-gray-500">Available around the clock</p>
            </div>
            <button onClick={() => setOperatingHours({ ...operatingHours, is24x7: !operatingHours.is24x7 })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${operatingHours.is24x7 ? 'bg-red-600' : 'bg-gray-200'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${operatingHours.is24x7 ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="flex justify-end pt-2">
            <button onClick={handleSaveAvailability} disabled={saving}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Availability'}
            </button>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
        <div className="space-y-1">
          {[
            { key: 'push', label: 'Push Notifications', desc: 'Browser push notifications for new bookings' },
            { key: 'sms', label: 'SMS Alerts', desc: 'Text messages for critical emergencies' },
            { key: 'email', label: 'Email Updates', desc: 'Email notifications for bookings and payments' },
            { key: 'sound', label: 'Sound Alerts', desc: 'Audio alerts for incoming emergencies' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div>
                <p className="font-medium text-gray-900 text-sm">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
              <button onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications[key as keyof typeof notifications] ? 'bg-red-600' : 'bg-gray-200'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications[key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input type="email" value={contactInfo.email} onChange={e => setContactInfo({ ...contactInfo, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
            <input type="tel" value={contactInfo.phone} onChange={e => setContactInfo({ ...contactInfo, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Number</label>
            <input type="tel" value={contactInfo.emergencyNumber} onChange={e => setContactInfo({ ...contactInfo, emergencyNumber: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" />
          </div>
          <div className="flex justify-end">
            <button onClick={handleContactUpdate} disabled={updatingContact}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
              {updatingContact ? 'Updating...' : 'Update Contact Info'}
            </button>
          </div>
        </div>
      </div>

      {/* Account Security */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Security</h2>
        {!showPasswordForm ? (
          <button onClick={() => setShowPasswordForm(true)}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            Change Password
          </button>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {[
              { key: 'currentPassword', label: 'Current Password' },
              { key: 'newPassword', label: 'New Password (min 8 chars)' },
              { key: 'confirmPassword', label: 'Confirm New Password' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label} *</label>
                <input type="password" value={passwordData[key as keyof typeof passwordData]}
                  onChange={e => setPasswordData({ ...passwordData, [key]: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required />
              </div>
            ))}
            <div className="flex gap-3">
              <button type="submit" disabled={changingPassword}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                {changingPassword ? 'Changing...' : 'Change Password'}
              </button>
              <button type="button" onClick={() => { setShowPasswordForm(false); setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Settings;
