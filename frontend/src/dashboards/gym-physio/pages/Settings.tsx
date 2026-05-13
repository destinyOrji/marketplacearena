import React, { useState, useEffect } from 'react';
import { changePassword, getProfile, updateProfile, uploadPhoto } from '../services/api';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'https://healthmarketarena.com';

const Settings: React.FC = () => {
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState({ email: true, sms: true, inApp: true });
  const [privacy, setPrivacy] = useState({ profileVisibility: 'public', showRatings: true });
  const [profile, setProfile] = useState<any>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getProfile();
      setProfile(data);
      if (data.profilePicture) {
        setPhotoPreview(`${API_URL}${data.profilePicture}`);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return;
    
    setUploadingPhoto(true);
    try {
      const result = await uploadPhoto(photoFile);
      const photoUrl = (result as any).photoUrl || '';
      
      if (photoUrl) {
        await updateProfile({ profilePicture: photoUrl });
        toast.success('Profile photo updated');
        setPhotoFile(null);
        fetchProfile();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleChangePassword = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwords.newPass.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    try {
      await changePassword(passwords.current, passwords.newPass);
      toast.success('Password changed successfully');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (e: any) {
      toast.error(e.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved');
  };

  const handleSavePrivacy = () => {
    toast.success('Privacy settings saved');
  };

  const inputClass = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm";

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {/* Profile Photo */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Photo</h2>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            {photoPreview ? (
              <img src={photoPreview} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-orange-100" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                <span className="text-5xl">👤</span>
              </div>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm text-gray-600 mb-3">Upload a professional photo (Max 5MB)</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <label className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm cursor-pointer inline-block">
                Choose Photo
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
              {photoFile && (
                <button 
                  onClick={handlePhotoUpload} 
                  disabled={uploadingPhoto}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 text-sm"
                >
                  {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Business Information */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
            <input 
              type="text" 
              className={inputClass} 
              value={profile?.businessName || ''} 
              onChange={e => setProfile((p: any) => ({ ...p, businessName: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
            <select 
              className={inputClass} 
              value={profile?.businessType || 'gym'}
              onChange={e => setProfile((p: any) => ({ ...p, businessType: e.target.value }))}
            >
              <option value="gym">Gym</option>
              <option value="physiotherapy">Physiotherapy</option>
              <option value="both">Both</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input 
              type="tel" 
              className={inputClass} 
              value={profile?.phone || ''} 
              onChange={e => setProfile((p: any) => ({ ...p, phone: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input 
              type="text" 
              className={inputClass} 
              value={profile?.city || ''} 
              onChange={e => setProfile((p: any) => ({ ...p, city: e.target.value }))}
            />
          </div>
        </div>
        <button 
          onClick={async () => {
            try {
              await updateProfile(profile);
              toast.success('Business information updated');
            } catch (error: any) {
              toast.error(error.message || 'Failed to update');
            }
          }}
          className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
        >
          Save Changes
        </button>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
        <div className="space-y-4">
          {[
            { key: 'email', label: 'Email Notifications', desc: 'Receive appointment updates via email' },
            { key: 'sms', label: 'SMS Notifications', desc: 'Receive appointment updates via SMS' },
            { key: 'inApp', label: 'In-App Notifications', desc: 'Receive in-app alerts and notifications' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div>
                <p className="font-medium text-gray-900">{label}</p>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={notifications[key as keyof typeof notifications]}
                  onChange={e => setNotifications(p => ({ ...p, [key]: e.target.checked }))}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
            </div>
          ))}
        </div>
        <button 
          onClick={handleSaveNotifications}
          className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
        >
          Save Preferences
        </button>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">Profile Visibility</p>
              <p className="text-sm text-gray-500">Control who can see your profile</p>
            </div>
            <select 
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              value={privacy.profileVisibility}
              onChange={e => setPrivacy(p => ({ ...p, profileVisibility: e.target.value }))}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-900">Show Ratings</p>
              <p className="text-sm text-gray-500">Display ratings on your profile</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={privacy.showRatings}
                onChange={e => setPrivacy(p => ({ ...p, showRatings: e.target.checked }))}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>
        </div>
        <button 
          onClick={handleSavePrivacy}
          className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
        >
          Save Settings
        </button>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input 
              type="password" 
              className={inputClass} 
              value={passwords.current}
              onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input 
              type="password" 
              className={inputClass} 
              value={passwords.newPass}
              onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))} 
              required 
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input 
              type="password" 
              className={inputClass} 
              value={passwords.confirm}
              onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} 
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={saving}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 text-sm"
          >
            {saving ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
