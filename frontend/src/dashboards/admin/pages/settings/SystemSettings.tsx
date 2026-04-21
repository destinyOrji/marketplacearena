import React, { useState, useEffect } from 'react';
import { Button, Input } from '../../components';
import { settingsService } from '../../services/settingsService';
import { SystemSettings as SystemSettingsType } from '../../types';

const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getSystemSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      await settingsService.updateSystemSettings(settings);
      alert('Settings saved successfully');
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!settings) return <div>Failed to load settings</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Platform Name"
          value={settings.platform_name}
          onChange={(e) => setSettings({ ...settings, platform_name: e.target.value })}
        />
        <Input
          label="Support Email"
          type="email"
          value={settings.support_email}
          onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
        />
        <Input
          label="Support Phone"
          value={settings.support_phone}
          onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })}
        />
        <Input
          label="Max Upload Size (MB)"
          type="number"
          value={settings.max_upload_size_mb}
          onChange={(e) => setSettings({ ...settings, max_upload_size_mb: Number(e.target.value) })}
        />
        <Input
          label="Session Timeout (Minutes)"
          type="number"
          value={settings.session_timeout_minutes}
          onChange={(e) => setSettings({ ...settings, session_timeout_minutes: Number(e.target.value) })}
        />
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.maintenance_mode}
              onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
              className="rounded"
            />
            <span>Maintenance Mode</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.registration_enabled}
              onChange={(e) => setSettings({ ...settings, registration_enabled: e.target.checked })}
              className="rounded"
            />
            <span>Registration Enabled</span>
          </label>
        </div>
      </div>
      <Button onClick={handleSave} loading={saving}>Save Settings</Button>
    </div>
  );
};

export default SystemSettings;
