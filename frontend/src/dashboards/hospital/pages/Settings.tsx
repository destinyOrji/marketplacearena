/**
 * Settings Page - Hospital Dashboard
 * General settings, preferences, and account configurations
 */
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  FiSave,
  FiMail,
  FiBell,
  FiLock,
  FiSettings,
  FiEyeOff,
  FiTrash2,
  FiAlertCircle,
} from 'react-icons/fi';
import { useHospital } from '../contexts/HospitalContext';
import { hospitalApi } from '../services/api';

const Settings: React.FC = () => {
  const { hospital } = useHospital();
  const [activeTab, setActiveTab] = useState<
    'general' | 'notifications' | 'security' | 'privacy' | 'danger'
  >('general');
  const [saving, setSaving] = useState(false);

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    language: 'en',
    timezone: 'Africa/Lagos',
    dateFormat: 'DD/MM/YYYY',
    currency: 'NGN',
  });

  // Notification Preferences
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailNotifications: true,
    smsNotifications: false,
    applicationAlerts: true,
    paymentAlerts: true,
    systemUpdates: true,
    promotionalEmails: false,
    weeklyDigest: true,
    instantAlerts: true,
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    loginNotifications: true,
  });

  // Password Change
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Privacy Settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: true,
    showPhone: true,
    dataSharing: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load saved settings from backend or localStorage
      const saved = localStorage.getItem('hospitalSettings');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.general) setGeneralSettings(data.general);
        if (data.notifications) setNotificationPrefs(data.notifications);
        if (data.security) setSecuritySettings(data.security);
        if (data.privacy) setPrivacySettings(data.privacy);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async (type: string, data: any) => {
    setSaving(true);
    try {
      // Save to backend (implement API endpoint)
      // For now, save to localStorage
      const current = JSON.parse(localStorage.getItem('hospitalSettings') || '{}');
      current[type] = data;
      localStorage.setItem('hospitalSettings', JSON.stringify(current));

      toast.success('Settings saved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleGeneralSave = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    await saveSettings('general', generalSettings);
  };

  const handleNotificationsSave = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    await saveSettings('notifications', notificationPrefs);
  };

  const handleSecuritySave = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    await saveSettings('security', securitySettings);
  };

  const handlePasswordChange = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwords.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
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

  const handlePrivacySave = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    await saveSettings('privacy', privacySettings);
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently deleted.'
    );
    if (!confirmed) return;

    const doubleConfirm = window.prompt(
      'Type "DELETE" to confirm account deletion:'
    );
    if (doubleConfirm !== 'DELETE') {
      toast.error('Account deletion cancelled');
      return;
    }

    setSaving(true);
    try {
      // Implement delete account API
      toast.error('Please contact support to delete your account');
      // await hospitalApi.deleteAccount();
      // localStorage.clear();
      // window.location.href = '/';
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account');
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
  const checkboxClass = 'w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500';

  const tabs = [
    { id: 'general', name: 'General', icon: FiSettings },
    { id: 'notifications', name: 'Notifications', icon: FiBell },
    { id: 'security', name: 'Security', icon: FiLock },
    { id: 'privacy', name: 'Privacy', icon: FiEyeOff },
    { id: 'danger', name: 'Danger Zone', icon: FiAlertCircle },
  ] as const;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your hospital account settings and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-200 flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <form onSubmit={handleGeneralSave} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  General Preferences
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Language</label>
                    <select
                      className={inputClass}
                      value={generalSettings.language}
                      onChange={(e) =>
                        setGeneralSettings((p) => ({ ...p, language: e.target.value }))
                      }
                    >
                      <option value="en">English</option>
                      <option value="fr">French</option>
                      <option value="ar">Arabic</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Timezone</label>
                    <select
                      className={inputClass}
                      value={generalSettings.timezone}
                      onChange={(e) =>
                        setGeneralSettings((p) => ({ ...p, timezone: e.target.value }))
                      }
                    >
                      <option value="Africa/Lagos">Lagos (GMT+1)</option>
                      <option value="Africa/Cairo">Cairo (GMT+2)</option>
                      <option value="Africa/Johannesburg">Johannesburg (GMT+2)</option>
                      <option value="UTC">UTC (GMT+0)</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Date Format</label>
                    <select
                      className={inputClass}
                      value={generalSettings.dateFormat}
                      onChange={(e) =>
                        setGeneralSettings((p) => ({ ...p, dateFormat: e.target.value }))
                      }
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Currency</label>
                    <select
                      className={inputClass}
                      value={generalSettings.currency}
                      onChange={(e) =>
                        setGeneralSettings((p) => ({ ...p, currency: e.target.value }))
                      }
                    >
                      <option value="NGN">Nigerian Naira (₦)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                      <option value="GBP">British Pound (£)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <FiSave className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <form onSubmit={handleNotificationsSave} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Notification Preferences
                </h3>
                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">
                      Notification Channels
                    </h4>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className={checkboxClass}
                          checked={notificationPrefs.emailNotifications}
                          onChange={(e) =>
                            setNotificationPrefs((p) => ({
                              ...p,
                              emailNotifications: e.target.checked,
                            }))
                          }
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Email Notifications
                          </p>
                          <p className="text-xs text-gray-500">
                            Receive notifications via email
                          </p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className={checkboxClass}
                          checked={notificationPrefs.smsNotifications}
                          onChange={(e) =>
                            setNotificationPrefs((p) => ({
                              ...p,
                              smsNotifications: e.target.checked,
                            }))
                          }
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-700">SMS Notifications</p>
                          <p className="text-xs text-gray-500">
                            Receive notifications via SMS
                          </p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className={checkboxClass}
                          checked={notificationPrefs.instantAlerts}
                          onChange={(e) =>
                            setNotificationPrefs((p) => ({
                              ...p,
                              instantAlerts: e.target.checked,
                            }))
                          }
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Instant Alerts</p>
                          <p className="text-xs text-gray-500">
                            Get real-time push notifications
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="border-b pb-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">
                      Notification Types
                    </h4>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className={checkboxClass}
                          checked={notificationPrefs.applicationAlerts}
                          onChange={(e) =>
                            setNotificationPrefs((p) => ({
                              ...p,
                              applicationAlerts: e.target.checked,
                            }))
                          }
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Job Application Alerts
                          </p>
                          <p className="text-xs text-gray-500">
                            New applications for your job postings
                          </p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className={checkboxClass}
                          checked={notificationPrefs.paymentAlerts}
                          onChange={(e) =>
                            setNotificationPrefs((p) => ({
                              ...p,
                              paymentAlerts: e.target.checked,
                            }))
                          }
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Payment Alerts</p>
                          <p className="text-xs text-gray-500">
                            Payment confirmations and billing updates
                          </p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className={checkboxClass}
                          checked={notificationPrefs.systemUpdates}
                          onChange={(e) =>
                            setNotificationPrefs((p) => ({
                              ...p,
                              systemUpdates: e.target.checked,
                            }))
                          }
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-700">System Updates</p>
                          <p className="text-xs text-gray-500">
                            Important platform updates and maintenance
                          </p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className={checkboxClass}
                          checked={notificationPrefs.promotionalEmails}
                          onChange={(e) =>
                            setNotificationPrefs((p) => ({
                              ...p,
                              promotionalEmails: e.target.checked,
                            }))
                          }
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Promotional Emails
                          </p>
                          <p className="text-xs text-gray-500">
                            Special offers and feature announcements
                          </p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className={checkboxClass}
                          checked={notificationPrefs.weeklyDigest}
                          onChange={(e) =>
                            setNotificationPrefs((p) => ({
                              ...p,
                              weeklyDigest: e.target.checked,
                            }))
                          }
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Weekly Digest</p>
                          <p className="text-xs text-gray-500">
                            Summary of your weekly activity
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <FiSave className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </form>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Password Change */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Change Password
                </h3>
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                  <div>
                    <label className={labelClass}>Current Password</label>
                    <input
                      type="password"
                      className={inputClass}
                      value={passwords.currentPassword}
                      onChange={(e) =>
                        setPasswords((p) => ({ ...p, currentPassword: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>New Password</label>
                    <input
                      type="password"
                      className={inputClass}
                      value={passwords.newPassword}
                      onChange={(e) =>
                        setPasswords((p) => ({ ...p, newPassword: e.target.value }))
                      }
                      required
                      minLength={8}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Must be at least 8 characters
                    </p>
                  </div>
                  <div>
                    <label className={labelClass}>Confirm New Password</label>
                    <input
                      type="password"
                      className={inputClass}
                      value={passwords.confirmPassword}
                      onChange={(e) =>
                        setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      <FiLock className="w-4 h-4" />
                      {saving ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Two-Factor Authentication */}
              <form onSubmit={handleSecuritySave} className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Additional Security
                  </h3>
                  <div className="space-y-4">
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        className={`${checkboxClass} mt-1`}
                        checked={securitySettings.twoFactorEnabled}
                        onChange={(e) =>
                          setSecuritySettings((p) => ({
                            ...p,
                            twoFactorEnabled: e.target.checked,
                          }))
                        }
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Two-Factor Authentication
                        </p>
                        <p className="text-xs text-gray-500">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                    </label>

                    <div>
                      <label className={labelClass}>Session Timeout (minutes)</label>
                      <select
                        className={inputClass}
                        value={securitySettings.sessionTimeout}
                        onChange={(e) =>
                          setSecuritySettings((p) => ({
                            ...p,
                            sessionTimeout: parseInt(e.target.value),
                          }))
                        }
                      >
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={60}>1 hour</option>
                        <option value={120}>2 hours</option>
                      </select>
                    </div>

                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        className={`${checkboxClass} mt-1`}
                        checked={securitySettings.loginNotifications}
                        onChange={(e) =>
                          setSecuritySettings((p) => ({
                            ...p,
                            loginNotifications: e.target.checked,
                          }))
                        }
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Login Notifications</p>
                        <p className="text-xs text-gray-500">
                          Get notified when someone logs into your account
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <FiSave className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Security Settings'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Privacy Settings */}
          {activeTab === 'privacy' && (
            <form onSubmit={handlePrivacySave} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Privacy Preferences
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Profile Visibility</label>
                    <select
                      className={inputClass}
                      value={privacySettings.profileVisibility}
                      onChange={(e) =>
                        setPrivacySettings((p) => ({
                          ...p,
                          profileVisibility: e.target.value,
                        }))
                      }
                    >
                      <option value="public">Public - Visible to everyone</option>
                      <option value="verified">Verified Users Only</option>
                      <option value="private">Private - Hidden from search</option>
                    </select>
                  </div>

                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className={`${checkboxClass} mt-1`}
                      checked={privacySettings.showEmail}
                      onChange={(e) =>
                        setPrivacySettings((p) => ({ ...p, showEmail: e.target.checked }))
                      }
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Show Email Address</p>
                      <p className="text-xs text-gray-500">
                        Display your email on your public profile
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className={`${checkboxClass} mt-1`}
                      checked={privacySettings.showPhone}
                      onChange={(e) =>
                        setPrivacySettings((p) => ({ ...p, showPhone: e.target.checked }))
                      }
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Show Phone Number</p>
                      <p className="text-xs text-gray-500">
                        Display your phone on your public profile
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className={`${checkboxClass} mt-1`}
                      checked={privacySettings.dataSharing}
                      onChange={(e) =>
                        setPrivacySettings((p) => ({ ...p, dataSharing: e.target.checked }))
                      }
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Allow Data Sharing for Analytics
                      </p>
                      <p className="text-xs text-gray-500">
                        Help us improve by sharing anonymous usage data
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <FiSave className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Privacy Settings'}
                </button>
              </div>
            </form>
          )}

          {/* Danger Zone */}
          {activeTab === 'danger' && (
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <FiAlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-900 mb-2">
                      Delete Hospital Account
                    </h3>
                    <p className="text-sm text-red-700 mb-4">
                      Once you delete your account, there is no going back. This will permanently
                      delete your hospital profile, all job postings, applications, and payment
                      history. This action cannot be undone.
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      {saving ? 'Deleting...' : 'Delete Account'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <FiAlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                      Data Export
                    </h3>
                    <p className="text-sm text-yellow-700 mb-4">
                      Download a copy of your hospital data including job postings, applications,
                      and payment history. This may take a few minutes to prepare.
                    </p>
                    <button
                      onClick={() => toast.info('Data export feature coming soon')}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                    >
                      <FiMail className="w-4 h-4" />
                      Request Data Export
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
