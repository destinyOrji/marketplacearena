// Settings Page
import React, { useState, useEffect } from 'react';
import { ProviderSettings, EmergencyProvider } from '../types';
import { settingsApi, profileApi } from '../services/api';
import { toast } from 'react-toastify';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<ProviderSettings | null>(null);
  const [provider, setProvider] = useState<EmergencyProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [changingPassword, setChangingPassword] = useState(false);

  // Contact info state
  const [contactInfo, setContactInfo] = useState({
    phone: '',
    email: '',
    emergencyPhone: '',
  });
  const [updatingContact, setUpdatingContact] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchProfile();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await settingsApi.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const data = await profileApi.getProfile();
      setProvider(data);
      setContactInfo({
        phone: data.phone || '',
        email: data.email || '',
        emergencyPhone: data.emergencyPhone || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      await settingsApi.updateSettings(settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateNotificationSetting = (key: keyof ProviderSettings['notifications'], value: boolean) => {
    if (!settings) return;
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value,
      },
    });
  };

  const updatePrivacySetting = (key: keyof ProviderSettings['privacy'], value: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      privacy: {
        ...settings.privacy,
        [key]: value,
      },
    });
  };

  const updateEmergencySetting = (key: keyof ProviderSettings['emergency'], value: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      emergency: {
        ...settings.emergency,
        [key]: value,
      },
    });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});

    // Validate passwords
    if (!passwordData.currentPassword) {
      setPasswordErrors({ currentPassword: 'Current password is required' });
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordErrors({ newPassword: 'Password must be at least 8 characters' });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setChangingPassword(true);
    try {
      await settingsApi.changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to change password';
      setPasswordErrors({ submit: errorMsg });
      toast.error(errorMsg);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleContactUpdate = async () => {
    if (!contactInfo.phone || !contactInfo.email) {
      toast.error('Phone and email are required');
      return;
    }

    setUpdatingContact(true);
    try {
      await profileApi.updateProfile({
        phone: contactInfo.phone,
        email: contactInfo.email,
        emergencyPhone: contactInfo.emergencyPhone,
      });
      toast.success('Contact information updated successfully');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to update contact information';
      toast.error(errorMsg);
    } finally {
      setUpdatingContact(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-600">Failed to load settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Notification Preferences */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
          <p className="text-sm text-gray-600 mb-6">
            Choose how you want to receive notifications about emergency bookings and updates
          </p>

          <div className="space-y-4">
            <ToggleSetting
              label="Push Notifications"
              description="Receive browser push notifications for emergency bookings"
              checked={settings.notifications.push}
              onChange={(checked) => updateNotificationSetting('push', checked)}
            />
            <ToggleSetting
              label="SMS Notifications"
              description="Receive text messages for critical emergency alerts"
              checked={settings.notifications.sms}
              onChange={(checked) => updateNotificationSetting('sms', checked)}
            />
            <ToggleSetting
              label="Email Notifications"
              description="Receive email updates about bookings and payments"
              checked={settings.notifications.email}
              onChange={(checked) => updateNotificationSetting('email', checked)}
            />
            <ToggleSetting
              label="Sound Alerts"
              description="Play sound alerts for new emergency bookings"
              checked={settings.notifications.sound}
              onChange={(checked) => updateNotificationSetting('sound', checked)}
            />
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h2>
          <p className="text-sm text-gray-600 mb-6">
            Control what information is visible to users
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Visibility
              </label>
              <select
                value={settings.privacy.profileVisibility}
                onChange={(e) => updatePrivacySetting('profileVisibility', e.target.value as 'public' | 'private')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="public">Public - Visible to all users</option>
                <option value="private">Private - Only visible when booking</option>
              </select>
            </div>

            <ToggleSetting
              label="Show Ratings"
              description="Display your ratings and reviews on your profile"
              checked={settings.privacy.showRatings}
              onChange={(checked) => updatePrivacySetting('showRatings', checked)}
            />
          </div>
        </div>

        {/* Emergency Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Emergency Settings</h2>
          <p className="text-sm text-gray-600 mb-6">
            Configure how you handle emergency bookings
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto-Decline Timer (seconds)
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Bookings will auto-decline if not accepted within this time
              </p>
              <input
                type="number"
                min="30"
                max="120"
                step="10"
                value={settings.emergency.autoDeclineAfter}
                onChange={(e) => updateEmergencySetting('autoDeclineAfter', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Simultaneous Bookings
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Maximum number of emergency bookings you can handle at once
              </p>
              <input
                type="number"
                min="1"
                max="5"
                value={settings.emergency.maxSimultaneousBookings}
                onChange={(e) => updateEmergencySetting('maxSimultaneousBookings', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
          <p className="text-sm text-gray-600 mb-6">
            Update your contact details
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={contactInfo.email}
                onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Emergency Contact Number
              </label>
              <input
                type="tel"
                value={contactInfo.emergencyPhone}
                onChange={(e) => setContactInfo({ ...contactInfo, emergencyPhone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleContactUpdate}
                disabled={updatingContact}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updatingContact ? 'Updating...' : 'Update Contact Info'}
              </button>
            </div>
          </div>
        </div>

        {/* Account Security */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Security</h2>
          <p className="text-sm text-gray-600 mb-6">
            Manage your password and security settings
          </p>

          {!showPasswordForm ? (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Change Password
            </button>
          ) : (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password *
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                {passwordErrors.currentPassword && (
                  <p className="text-red-600 text-sm mt-1">{passwordErrors.currentPassword}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password *
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
                {passwordErrors.newPassword && (
                  <p className="text-red-600 text-sm mt-1">{passwordErrors.newPassword}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1">{passwordErrors.confirmPassword}</p>
                )}
              </div>

              {passwordErrors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {passwordErrors.submit}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setPasswordErrors({});
                  }}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Save Settings Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Toggle Setting Component
interface ToggleSettingProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const ToggleSetting: React.FC<ToggleSettingProps> = ({ label, description, checked, onChange }) => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-900">{label}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
          checked ? 'bg-red-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

export default Settings;
