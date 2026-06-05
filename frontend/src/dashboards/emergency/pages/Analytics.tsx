import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/apiClient';

const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>({});
  const [stats, setStats]         = useState<any>({});
  const [loading, setLoading]     = useState(true);
  const [period, setPeriod]       = useState('month');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [analyticsRes, statsRes] = await Promise.all([
        apiClient.get('/ambulance/analytics', { params: { period } }).catch(() => ({ data: { data: {} } })),
        apiClient.get('/ambulance/dashboard-stats').catch(() => ({ data: { data: {} } })),
      ]);
      setAnalytics(analyticsRes.data?.data || analyticsRes.data || {});
      setStats(statsRes.data?.data || statsRes.data || {});
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExport = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Emergencies', analytics.totalEmergencies ?? 0],
      ['Completion Rate (%)', (analytics.completionRate || 0).toFixed(1)],
      ['Avg Rating', (analytics.averageRating || 0).toFixed(1)],
      ['Total Reviews', analytics.totalReviews ?? 0],
      ['Avg Response Time (min)', analytics.averageResponseTime ?? 'N/A'],
      [],
      ['Emergency Type', 'Count'],
      ...(analytics.emergencyTypeBreakdown || []).map((e: any) => [e.type, e.count]),
      [],
      ['Hour', 'Bookings'],
      ...(analytics.peakHours || []).map((h: any) => [h.hour, h.count]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `ambulance-analytics-${period}.csv`;
    document.body.appendChild(a); a.click();
    URL.revokeObjectURL(url); document.body.removeChild(a);
  };

  const total           = analytics.totalEmergencies ?? 0;
  const completionRate  = (analytics.completionRate || 0).toFixed(1);
  const completed       = total > 0 ? Math.round((analytics.completionRate || 0) / 100 * total) : 0;
  const cancelled       = total - completed;
  const typeBreakdown   = analytics.emergencyTypeBreakdown || [];
  const peakHours       = analytics.peakHours || [];

  const kpis = [
    { label: 'Total Emergencies', value: total,                                          emoji: '🚨', color: 'from-red-500 to-red-700' },
    { label: 'Completed',         value: completed,                                      emoji: '✅', color: 'from-green-500 to-green-700' },
    { label: 'Completion Rate',   value: `${completionRate}%`,                           emoji: '📈', color: 'from-purple-500 to-purple-700' },
    { label: 'Avg Rating',        value: (analytics.averageRating || 0).toFixed(1) + ' ⭐', emoji: '⭐', color: 'from-yellow-500 to-yellow-700' },
    { label: 'Active Vehicles',   value: stats.activeVehicles ?? stats.totalVehicles ?? 0, emoji: '🚑', color: 'from-orange-500 to-orange-700' },
    { label: 'Total Reviews',     value: analytics.totalReviews ?? 0,                   emoji: '💬', color: 'from-blue-500 to-blue-700' },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Emergency service performance overview</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Period selector */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {['week', 'month', 'quarter', 'year'].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  period === p ? 'bg-white text-red-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                }`}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          <button onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h2>
              {total === 0 ? (
                <div className="text-center py-8">
                  <p className="text-4xl mb-2">📋</p>
                  <p className="text-gray-500 text-sm">No bookings in this period</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {[
                    { label: 'Completed', count: completed, color: 'bg-green-500' },
                    { label: 'Cancelled / Other', count: Math.max(0, cancelled), color: 'bg-red-500' },
                  ].map(({ label, count, color }) => {
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

            {/* Emergency Types */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Emergency Types</h2>
              {typeBreakdown.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-4xl mb-2">🚑</p>
                  <p className="text-gray-500 text-sm">No data available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {typeBreakdown.map((item: any) => {
                    const pct = total > 0 ? (item.count / total) * 100 : 0;
                    return (
                      <div key={item.type}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700 truncate">{item.type}</span>
                          <span className="text-gray-600 ml-2 flex-shrink-0">{item.count} ({pct.toFixed(1)}%)</span>
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

          {/* Peak Hours */}
          {peakHours.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Peak Activity Hours</h2>
              <div className="flex items-end gap-1 h-24">
                {Array.from({ length: 24 }, (_, h) => {
                  const found = peakHours.find((p: any) => p.hour === h);
                  const count = found?.count || 0;
                  const maxCount = Math.max(...peakHours.map((p: any) => p.count), 1);
                  const height = Math.round((count / maxCount) * 100);
                  return (
                    <div key={h} className="flex-1 flex flex-col items-center gap-1" title={`${h}:00 — ${count} bookings`}>
                      <div className="w-full bg-red-500 rounded-sm transition-all hover:bg-red-600"
                        style={{ height: `${Math.max(height, count > 0 ? 4 : 0)}%` }} />
                      {h % 6 === 0 && <span className="text-xs text-gray-400">{h}h</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Performance Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">All-Time Performance</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Bookings',     value: stats.totalBookings ?? 0 },
                { label: 'Completed',          value: stats.completedBookings ?? 0 },
                { label: 'Avg Response Time',  value: analytics.averageResponseTime ? `${analytics.averageResponseTime} min` : 'N/A' },
                { label: 'Total Vehicles',     value: stats.totalVehicles ?? 0 },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
