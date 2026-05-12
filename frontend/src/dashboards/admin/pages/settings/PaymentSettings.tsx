import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { authService } from '../../services/authService';

const API_URL = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';

const PaymentSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    provider: 'paystack',
    api_key: '',
    test_mode: true,
    platformFeePercent: 10,
    adminBankAccount: {
      bankName: '',
      accountNumber: '',
      accountName: '',
      bankCode: '',
    },
  });

  const getHeaders = () => ({ headers: { Authorization: `Bearer ${authService.getAccessToken()}` } });

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/settings/payment`, getHeaders());
      const data = res.data?.data || {};
      setSettings(prev => ({
        ...prev,
        provider: data.provider || 'paystack',
        api_key: data.api_key || '',
        test_mode: data.test_mode ?? true,
        platformFeePercent: data.platformFeePercent ?? 10,
        adminBankAccount: {
          bankName:      data.adminBankAccount?.bankName || '',
          accountNumber: data.adminBankAccount?.accountNumber || '',
          accountName:   data.adminBankAccount?.accountName || '',
          bankCode:      data.adminBankAccount?.bankCode || '',
        },
      }));
    } catch {
      toast.error('Failed to load payment settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_URL}/admin/settings/payment`, settings, getHeaders());
      toast.success('Payment settings saved');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-48">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Payment Configuration</h2>
        <p className="text-sm text-gray-500 mt-1">Configure Paystack keys, platform fee, and admin payout account</p>
      </div>

      {/* Paystack Config */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <span className="text-xl">💳</span> Paystack Configuration
        </h3>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Public Key</label>
          <input type="text" value={settings.api_key}
            onChange={e => setSettings(s => ({ ...s, api_key: e.target.value }))}
            placeholder="pk_test_... or pk_live_..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 font-mono" />
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <input type="checkbox" id="test_mode" checked={settings.test_mode}
            onChange={e => setSettings(s => ({ ...s, test_mode: e.target.checked }))}
            className="w-4 h-4 text-blue-600 rounded" />
          <label htmlFor="test_mode" className="text-sm font-medium text-gray-700">
            Test Mode {settings.test_mode ? '(using test keys)' : '(using live keys)'}
          </label>
        </div>

        <div className={`p-3 rounded-xl text-xs ${settings.test_mode ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {settings.test_mode
            ? '🧪 Test mode: payments are simulated. Use test card 4084 0840 8408 4081'
            : '✅ Live mode: real payments are processed'}
        </div>
      </div>

      {/* Platform Fee */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <span className="text-xl">🏛</span> Platform Fee
        </h3>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Platform Commission (%)
          </label>
          <div className="flex items-center gap-3">
            <input type="number" min="0" max="50" step="0.5"
              value={settings.platformFeePercent}
              onChange={e => setSettings(s => ({ ...s, platformFeePercent: parseFloat(e.target.value) || 0 }))}
              className="w-32 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 text-center font-bold text-lg" />
            <span className="text-gray-500 text-sm">% of each payment</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Example: Patient pays ₦10,000 → Platform keeps ₦{(10000 * settings.platformFeePercent / 100).toLocaleString()} → Provider receives ₦{(10000 * (1 - settings.platformFeePercent / 100)).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Admin Bank Account */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <span className="text-xl">🏦</span> Admin Payout Account
        </h3>
        <p className="text-sm text-gray-500">Platform fees will be collected into this account</p>

        {[
          { key: 'bankName',      label: 'Bank Name',       placeholder: 'e.g. First Bank, GTBank' },
          { key: 'accountNumber', label: 'Account Number',  placeholder: '10-digit account number' },
          { key: 'accountName',   label: 'Account Name',    placeholder: 'Name on the account' },
          { key: 'bankCode',      label: 'Bank Code',       placeholder: 'e.g. 011 for First Bank' },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{f.label}</label>
            <input type="text"
              value={(settings.adminBankAccount as any)[f.key]}
              onChange={e => setSettings(s => ({ ...s, adminBankAccount: { ...s.adminBankAccount, [f.key]: e.target.value } }))}
              placeholder={f.placeholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
          </div>
        ))}
      </div>

      {/* Save */}
      <button onClick={handleSave} disabled={saving}
        className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-sm">
        {saving ? (
          <>
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Saving...
          </>
        ) : '💾 Save Payment Settings'}
      </button>
    </div>
  );
};

export default PaymentSettings;
