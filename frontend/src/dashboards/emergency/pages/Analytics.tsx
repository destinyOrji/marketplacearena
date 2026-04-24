import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

const Analytics: React.FC = () => {
  const [stats, setStats] = useState<any>({});
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => { fetchData(); }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        apiClient.get('/ambulance/dashboard-stats').catch(() => ({ data: {} })),
        apiClient.get('/ambulance/bookings').catch(() => ({ data: { data: [] } })),
      ]);
      setStats(statsRes.data?.data || statsRes.data || {});
      const allBookings = Array.isArray(bookingsRes.data?.data) ? bookingsRes.data.data : [];

      // Filter by period
      const now = new Date();
      const cutoff = new Date();
      if (period === 'week') cutoff.setDate(now.getDate() - 7);
      else if (period === 'month') cutoff.setMonth(now.getMonth() - 1);
      else if (period === 'quarter') cutoff.setMonth(now.getMonth() - 3);
      else cutoff.setFullYear(now.getFullYear() - 1);

      setBookings(allBookings.filter((b: any) => !b.createdAt || new Date(b.createdAt) >= cutoff));
    } catch { }
    finally { setLoading(false); }
  };

  // Compute derived metrics from bookings
  const total = bookings.length;
  const completed = bookings.filter((b: any) => b.status === 'completed').length;
  const cancelled = bookings.filter((b: any) => b.status === 'cancelled').length;
  const pending = bookings.filter((b: any) => b.status === 'pending' || b.status === 'active').length;
  const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : '0.0';

  // Emergency type breakdown
  const typeMap: Record<string, number> = {};
  bookings.forEach((b: any) => {
    const t = b.emergencyType || 'Other';
    typeMap[t] = (typeMap[t] || 0) + 1;
  });
  const typeBreakdown = Object.entries(typeMap).sort((a, b) => b[1] - a[1]).slice(0, 6);

  // Status breakdown
  const statusData = [
    { label: 'Completed', count: completed, color: 'bg-green-500' },
    { label: 'Cancelled', count: cancelled, color: 'bg-red-500' },
    { label: 'Pending/Active', count: pending, color: 'bg-yellow-500' },
  ];

  const kpis = [
    { label: 'Total Bookings', value: total, emoji: '📋', color: 'from-blue-500 to-blue-700' },
    { label: 'Completed', value: completed, emoji: '✅', color: 'from-green-500 to-green-700' },
    { label: 'Completion Rate', value: `${completionRate}%`, emoji: '📈', color: 'from-purple-500 to-purple-700' },
    { label: 'Avg Rating', value: (stats.averageRating || 0).toFixed(1) + ' ⭐', emoji: '⭐', color: 'from-yellow-500 to-yellow-700' },
    { label: 'Active Vehicles', value: stats.activeVehicles ?? 0, emoji: '🚑', color: 'from-red-500 to-red-700' },
    { label: 'Total Reviews', value: stats.totalReviews ?? 0, emoji: '💬', color: 'from-orange-500 to-orange-700' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <select value={period} onChange={e => setPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="quarter">Last Quarter</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map(({ label, value, emoji, color }) => (
          <div key={label} className={`bg-gradient-to-br ${color} rounded-xl p-6 text-white shadow-sm`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium opacity-90">{label}</p>
              <span className="text-2xl">{emoji}</span>
            </div>
            <p className="text-3xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Status Breakdown</h2>
          {total === 0 ? (
            <p className="text-gray-500 text-center py-8">No bookings in this period</p>
          ) : (
            <div className="space-y-4">
              {statusData.map(({ label, count, color }) => {
                const pct = total > 0 ? (count / total) * 100 : 0;
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

        {/* Emergency Type Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Emergency Types</h2>
          {typeBreakdown.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No data available</p>
          ) : (
            <div className="space-y-3">
              {typeBreakdown.map(([type, count]) => {
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 truncate">{type}</span>
                      <span className="text-gray-600 ml-2">{count} ({pct.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Bookings (All Time)', value: stats.totalBookings ?? 0 },
            { label: 'Completed (All Time)', value: stats.completedBookings ?? 0 },
            { label: 'Avg Response Time', value: stats.averageResponseTime ? `${stats.averageResponseTime} min` : 'N/A' },
            { label: 'Total Vehicles', value: stats.totalVehicles ?? 0 },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
