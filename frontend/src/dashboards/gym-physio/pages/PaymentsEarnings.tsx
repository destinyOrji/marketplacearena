import React, { useEffect, useState } from 'react';
import { getEarnings, getPayments } from '../services/api';

const PaymentsEarnings: React.FC = () => {
  const [earnings, setEarnings] = useState<any>({});
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getEarnings().then(setEarnings).catch(() => {}),
      getPayments().then(d => setPayments(Array.isArray(d) ? d : [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
    </div>
  );

  const cards = [
    { label: 'Total Earnings', value: `₦${(earnings.totalEarnings || 0).toLocaleString()}`, color: 'from-green-500 to-green-700', emoji: '💰' },
    { label: 'Pending Payments', value: `₦${(earnings.pendingPayments || 0).toLocaleString()}`, color: 'from-yellow-500 to-yellow-700', emoji: '⏳' },
    { label: 'Net Earnings', value: `₦${(earnings.netEarnings || 0).toLocaleString()}`, color: 'from-blue-500 to-blue-700', emoji: '📈' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Payments & Earnings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map(({ label, value, color, emoji }) => (
          <div key={label} className={`bg-gradient-to-br ${color} rounded-xl p-6 text-white`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm opacity-90">{label}</p>
              <span className="text-2xl">{emoji}</span>
            </div>
            <p className="text-3xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
        {payments.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-4xl mb-2">💳</p>
            <p className="text-gray-500">No transactions yet</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Date', 'Client', 'Service', 'Amount', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.map((p: any, i: number) => (
                <tr key={p._id || i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">{p.date ? new Date(p.date).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.patient || p.client || 'Client'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.service || 'Service'}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">₦{(p.netAmount || p.amount || 0).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">{p.status || 'completed'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PaymentsEarnings;
