import React, { useState, useEffect } from 'react';
import { Button, Input } from '../../components';
import { settingsService } from '../../services/settingsService';
import { PaymentSettings as PaymentSettingsType } from '../../types';

const PaymentSettings: React.FC = () => {
  const [settings, setSettings] = useState<PaymentSettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await settingsService.getPaymentSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch payment settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    try {
      await settingsService.updatePaymentSettings(settings);
      alert('Payment settings saved successfully');
    } catch (error) {
      alert('Failed to save payment settings');
    }
  };

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      const success = await settingsService.testPaymentConnection();
      alert(success ? 'Connection successful!' : 'Connection failed');
    } catch (error) {
      alert('Connection test failed');
    } finally {
      setTesting(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!settings) return <div>Failed to load settings</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Payment Provider"
          value={settings.provider}
          onChange={(e) => setSettings({ ...settings, provider: e.target.value })}
        />
        <Input
          label="API Key"
          type="password"
          value={settings.api_key}
          onChange={(e) => setSettings({ ...settings, api_key: e.target.value })}
        />
        <Input
          label="Secret Key"
          type="password"
          value={settings.secret_key}
          onChange={(e) => setSettings({ ...settings, secret_key: e.target.value })}
        />
        <Input
          label="Webhook URL"
          value={settings.webhook_url}
          onChange={(e) => setSettings({ ...settings, webhook_url: e.target.value })}
        />
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.test_mode}
            onChange={(e) => setSettings({ ...settings, test_mode: e.target.checked })}
            className="rounded"
          />
          <span>Test Mode</span>
        </label>
      </div>
      <div className="flex space-x-3">
        <Button onClick={handleSave}>Save Settings</Button>
        <Button variant="secondary" onClick={handleTestConnection} loading={testing}>
          Test Connection
        </Button>
      </div>
    </div>
  );
};

export default PaymentSettings;
