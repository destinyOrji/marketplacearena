import React, { useEffect, useState, useCallback } from 'react';
import { gymPhysioApiClient as apiClient } from '../services/api';

const Analytics: React.FC = () => {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/gym-physio/analytics', { params: { period } });
      setData(res.data?.data || res.data || {});
    } catch {
      setData({});
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExport = (format: 'csv' | 'print') => {
    if (format === 'csv') {
      const rows = [
        ['Metric', 'Value'],
        ['Total Bookings', data.totalBookings ?? 0],
        ['Completed', data.completedBookings ?? 0],
        ['Cancelled', data.cancelledBookings ?? 0],
        ['Completion Rate (%)', data.completionRate ?? 0],
        ['Average Rating', (data.averageRating || 0).toFixed(1)],
        ['Total Reviews', data.totalReviews ?? 0],
        ['Active Services', data.activeServices ?? 0],
        ['Total Revenue (NGN)', data.totalRevenue ?? 0],
        [],
        ['Service', 'Bookings', 'Revenue', 'Avg Rating'],
        ...(data.popularServices || []).map((s: any) => [s.serviceName || s.title, s.bookings || 0, s.revenue || 0, (s.averageRating || 0).toFixed(1)]),
      ];
      const csv = rows.map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `gym-analytics-${period}.csv`;
      document.body.appendChild(a); a.click(); URL.revokeObjectURL(url); document.body.removeChild(a);
    } else {
      window.print();
    }
  };

  const kpis = [
    { label: 'Total Bookings', value: data.totalBookings ?? 0, emoji: '📅', color: 'from-orange-500 to-orange-700' },
    { label: 'Completed', value: data.completedBookings ?? 0, emoji: '✅', color: 'from-green-500 to-green-700' },
    { label: 'Cancelled', value: data.cancelledBookings ?? 0, emoji: '❌', color: 'from-red-500 to-red-700' },
    { label: 'Completion Rate', value: `${data.completionRate ?? 0}%`, emoji: '📊', color: 'from-blue-500 to-blue-700' },
    { label: 'Average Rating', value: (data.averageRating || 0).toFixed(1), emoji: '⭐', color: 'from-yellow-500 to-yellow-700' },
    { label: 'Total Reviews', value: data.totalReviews ?? 0, emoji: '💬', color: 'from-purple-500 to-purple-700' },
    { label: 'Active Services', value: data.activeServices ?? 0, emoji: '💪', color: 'from-pink-500 to-pink-700' },
    { label: 'Total Revenue', value: `₦${(data.totalRevenue || 0).toLocaleString()}`, emoji: '💰', color: 'from-teal-500 to-teal-700' },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track your performance and insights</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleExport('csv')}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
          <button onClick={() => handleExport('print')}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Time Period:</span>
          <div className="flex gap-2 flex-wrap">
            {['week', 'month', 'quarter', 'year'].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  period === p ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-xl shadow-sm">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {kpis.map(({ label, value, emoji, color }) => (
              <div key={label} className={`bg-gradient-to-br ${color} rounded-xl shadow-md p-6 text-white`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{emoji}</span>
                </div>
                <p className="text-3xl font-bold mb-1">{value}</p>
                <p className="text-sm opacity-90">{label}</p>
              </div>
            ))}
          </div>

          {/* Status Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h2>
              {(data.totalBookings ?? 0) === 0 ? (
                <p className="text-gray-500 text-center py-8">No bookings in this period</p>
              ) : (
                <div className="space-y-4">
                  {[
                    { label: 'Completed', count: data.completedBookings ?? 0, color: 'bg-green-500' },
                    { label: 'Cancelled', count: data.cancelledBookings ?? 0, color: 'bg-red-500' },
                    { label: 'Pending', count: Math.max(0, (data.totalBookings ?? 0) - (data.completedBookings ?? 0) - (data.cancelledBookings ?? 0)), color: 'bg-yellow-500' },
                  ].map(({ label, count, color }) => {
                    const pct = (data.totalBookings ?? 0) > 0 ? (count / data.totalBookings) * 100 : 0;
                    return (
                      <div key={label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700">{label}</span>
                          <span className="text-gray-600">{count} ({pct.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div className={`${color} h-3 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Performance Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h2>
              <div className="space-y-3">
                {[
                  { label: 'Total Bookings', value: data.totalBookings ?? 0, cls: 'bg-gray-50 text-gray-900' },
                  { label: 'Completion Rate', value: `${data.completionRate ?? 0}%`, cls: 'bg-green-50 text-green-700' },
                  { label: 'Total Revenue', value: `₦${(data.totalRevenue || 0).toLocaleString()}`, cls: 'bg-teal-50 text-teal-700' },
                  { label: 'Avg Rating', value: `${(data.averageRating || 0).toFixed(1)} ⭐`, cls: 'bg-yellow-50 text-yellow-700' },
                  { label: 'Active Services', value: data.activeServices ?? 0, cls: 'bg-pink-50 text-pink-700' },
                  { label: 'Total Reviews', value: data.totalReviews ?? 0, cls: 'bg-purple-50 text-purple-700' },
                ].map(({ label, value, cls }) => (
                  <div key={label} className={`flex justify-between items-center p-3 rounded-lg ${cls}`}>
                    <span className="text-sm font-medium">{label}</span>
                    <span className="font-bold">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Popular Services */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Services</h2>
            {data.popularServices && data.popularServices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Rank', 'Service', 'Bookings', 'Revenue', 'Avg Rating', 'Performance'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.popularServices.map((s: any, i: number) => {
                      const bookings = s.bookings || 0;
                      const maxBookings = Math.max(...data.popularServices.map((x: any) => x.bookings || 0), 1);
                      const performance = Math.round((bookings / maxBookings) * 100);
                      return (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                              i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-700' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-blue-50 text-blue-600'
                            }`}>{i + 1}</div>
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900">{s.serviceName || s.title || 'Service'}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">{bookings}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-green-600">₦{(s.revenue || 0).toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-400">⭐</span>
                              <span className="text-sm font-medium">{(s.averageRating || 0).toFixed(1)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                                <div className="bg-gradient-to-r from-orange-500 to-orange-700 h-2 rounded-full" style={{ width: `${performance}%` }} />
                              </div>
                              <span className="text-xs font-medium text-gray-600">{performance}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-4xl mb-2">📊</p>
                <p className="text-gray-500 text-sm">No service data yet. Complete sessions to see analytics.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
