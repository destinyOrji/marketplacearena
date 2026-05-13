import React, { useEffect, useState } from 'react';
import { getAnalytics } from '../services/api';

const Analytics: React.FC = () => {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then(d => setData(d || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
    </div>
  );

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track your performance and insights</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map(({ label, value, emoji, color }) => (
          <div key={label} className={`bg-gradient-to-br ${color} rounded-xl shadow-md p-6 text-white`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">{emoji}</span>
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <span className="text-xl">{emoji}</span>
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{value}</p>
            <p className="text-sm opacity-90">{label}</p>
          </div>
        ))}
      </div>

      {/* Popular Services */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Services</h2>
        {data.popularServices && data.popularServices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Service Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Bookings</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Revenue</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Avg Rating</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.popularServices.map((s: any, i: number) => {
                  const bookings = s.bookings || 0;
                  const maxBookings = Math.max(...data.popularServices.map((x: any) => x.bookings || 0));
                  const performance = maxBookings > 0 ? Math.round((bookings / maxBookings) * 100) : 0;
                  
                  return (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          i === 0 ? 'bg-yellow-100 text-yellow-700' :
                          i === 1 ? 'bg-gray-100 text-gray-700' :
                          i === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                          {i + 1}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">{s.serviceName || s.title || 'Service'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-gray-900">{bookings}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-green-600">₦{(s.revenue || 0).toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400">⭐</span>
                          <span className="text-sm font-medium">{(s.averageRating || 0).toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                            <div
                              className="bg-gradient-to-r from-orange-500 to-orange-700 h-2 rounded-full"
                              style={{ width: `${performance}%` }}
                            />
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
            <p className="text-gray-500 text-sm">No service data yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
