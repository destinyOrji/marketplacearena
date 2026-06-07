import React, { useEffect, useState } from 'react';
import { getEarnings, getPayments } from '../services/api';
import { gymPhysioApiClient as apiClient } from '../services/api';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const PLATFORM_FEE = 0.10;

type ActiveTab = 'earnings' | 'bank';

const PaymentsEarnings: React.FC = () => {
  const [tab, setTab] = useState<ActiveTab>('earnings');
  const [earnings, setEarnings] = useState<any>({});
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bankAccount, setBankAccount] = useState({ bankName: '', accountNumber: '', accountName: '', bankCode: '' });
  const [savingBank, setSavingBank] = useState(false);

  const getToken = () => localStorage.getItem('gymPhysioToken') || localStorage.getItem('authToken') || '';

  useEffect(() => {
    Promise.all([
      getEarnings().then(setEarnings).catch(() => {}),
      getPayments().then(d => setPayments(Array.isArray(d) ? d : [])).catch(() => {}),
      apiClient.get('/gym-physio/bank-account')
        .then((r: any) => { const b = r.data?.data || {}; setBankAccount({ bankName: b.bankName || '', accountNumber: b.accountNumber || '', accountName: b.accountName || '', bankCode: b.bankCode || '' }); })
        .catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const saveBankAccount = async () => {
    setSavingBank(true);
    try {
      await apiClient.put('/gym-physio/bank-account', bankAccount);
      toast.success('Bank account saved successfully');
    } catch {
      toast.error('Failed to save bank account');
    } finally {
      setSavingBank(false);
    }
  };

  const totalEarnings = earnings.totalEarnings || 0;
  const platformFees = earnings.platformFees || Math.round(totalEarnings * PLATFORM_FEE);
  const netEarnings = earnings.netEarnings || (totalEarnings - platformFees);
  const pending = earnings.pendingPayments || 0;
  const totalTransactions = payments.length;
  const completedPayments = payments.filter((p: any) => p.status === 'completed' || p.status === 'paid').length;
  const failedPayments = payments.filter((p: any) => p.status === 'failed').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments & Earnings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track your income and manage payout settings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Earned', value: `₦${totalEarnings.toLocaleString()}`, icon: '💰', color: 'bg-blue-50 text-blue-600' },
          { label: 'Pending',      value: `₦${pending.toLocaleString()}`,       icon: '⏳', color: 'bg-amber-50 text-amber-600' },
          { label: 'Platform Fee', value: `₦${platformFees.toLocaleString()}`,  icon: '🏛', color: 'bg-red-50 text-red-500' },
          { label: 'Net Earnings', value: `₦${netEarnings.toLocaleString()}`,   icon: '📈', color: 'bg-green-50 text-green-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-4">
            <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center text-lg mb-2`}>{s.icon}</div>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Transactions', value: totalTransactions, icon: '📊', color: 'bg-purple-50 text-purple-600' },
          { label: 'Completed', value: completedPayments, icon: '✅', color: 'bg-green-50 text-green-600' },
          { label: 'Failed', value: failedPayments, icon: '❌', color: 'bg-red-50 text-red-500' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center text-base mb-2`}>{s.icon}</div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl w-fit">
        {[
          { value: 'earnings', label: '💳 Payment History' },
          { value: 'bank',     label: '🏦 Bank Account' },
        ].map(t => (
          <button key={t.value} onClick={() => setTab(t.value as ActiveTab)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === t.value ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Payment History */}
      {tab === 'earnings' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            </div>
          ) : payments.length === 0 ? (
            <div className="p-16 text-center">
              <div className="text-5xl mb-4">💳</div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">No payments yet</h3>
              <p className="text-sm text-gray-500">Payments from confirmed bookings will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    {['Date', 'Client', 'Service', 'Gross', 'Platform Fee', 'Net', 'Status'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.map((p: any, i) => {
                    const gross = p.grossAmount || p.amount || 0;
                    const fee = p.platformFee || Math.round(gross * PLATFORM_FEE);
                    const net = p.netAmount || (gross - fee);
                    return (
                      <tr key={p._id || i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5 text-sm text-gray-600 whitespace-nowrap">
                          {p.date ? format(new Date(p.date), 'MMM d, yyyy') : '—'}
                        </td>
                        <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{p.patient || p.client || 'Client'}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-600 max-w-[140px] truncate">{p.service || 'Service'}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-900 font-medium">₦{gross.toLocaleString()}</td>
                        <td className="px-5 py-3.5 text-sm text-red-500">-₦{fee.toLocaleString()}</td>
                        <td className="px-5 py-3.5 text-sm font-bold text-green-700">₦{net.toLocaleString()}</td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 capitalize">
                            {p.status || 'completed'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Bank Account */}
      {tab === 'bank' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-lg">
          <div className="mb-5">
            <h2 className="text-base font-bold text-gray-900">Payout Bank Account</h2>
            <p className="text-sm text-gray-500 mt-1">
              Your net earnings (after 10% platform fee) will be transferred to this account.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { key: 'bankName', label: 'Bank Name', placeholder: 'e.g. First Bank, GTBank' },
              { key: 'accountNumber', label: 'Account Number', placeholder: '10-digit account number' },
              { key: 'accountName', label: 'Account Name', placeholder: 'Name on the account' },
              { key: 'bankCode', label: 'Bank Code (Optional)', placeholder: 'e.g. 011' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{f.label}</label>
                <input type="text" value={(bankAccount as any)[f.key]}
                  onChange={e => setBankAccount(b => ({ ...b, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            ))}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
              💡 Platform fee: <strong>10%</strong> of each payment is retained by Health Market Arena. The remaining <strong>90%</strong> is your net earnings.
            </div>
            <button onClick={saveBankAccount} disabled={savingBank}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {savingBank ? 'Saving...' : '💾 Save Bank Account'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsEarnings;
