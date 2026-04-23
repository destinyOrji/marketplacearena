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
    { label: 'Total Bookings', value: data.totalBookings ?? 0, emoji: '📅', color: 'bg-orange-100 text-orange-700' },
    { label: 'Completed', value: data.completedBookings ?? 0, emoji: '✅', color: 'bg-green-100 text-green-700' },
    { label: 'Completion Rate', value: `${data.completionRate ?? 0}%`, emoji: '📊', color: 'bg-blue-100 text-blue-700' },
    { label: 'Average Rating', value: (data.averageRating || 0).toFixed(1), emoji: '⭐', color: 'bg-yellow-100 text-yellow-700' },
    { label: 'Total Reviews', value: data.totalReviews ?? 0, emoji: '💬', color: 'bg-purple-100 text-purple-700' },
    { label: 'Active Services', value: data.activeServices ?? 0, emoji: '💪', color: 'bg-pink-100 text-pink-700' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map(({ label, value, emoji, color }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{label}</p>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
              </div>
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${color}`}>
                <span className="text-2xl">{emoji}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Popular Services */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Services</h2>
        {data.popularServices && data.popularServices.length > 0 ? (
          <div className="space-y-3">
            {data.popularServices.map((s: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </div>
                  <span className="font-medium text-gray-900">{s.serviceName || s.title}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{s.bookings || 0} bookings</p>
                  <p className="text-xs text-gray-500">₦{(s.revenue || 0).toLocaleString()}</p>
                </div>
              </div>
            ))}
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
