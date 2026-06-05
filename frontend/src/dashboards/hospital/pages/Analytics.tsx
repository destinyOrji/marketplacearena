import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';

const Analytics: React.FC = () => {
  const [data, setData]       = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [period, setPeriod]   = useState('month');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('hospitalToken') || localStorage.getItem('authToken');
      const res = await axios.get(`${API_URL}/hospitals/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { period },
      });
      setData(res.data?.data || res.data || {});
    } catch {
      setData({});
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExport = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Vacancies', data.totalVacancies ?? 0],
      ['Active Vacancies', data.activeVacancies ?? 0],
      ['Total Applications', data.totalApplications ?? 0],
      ['Pending', data.pendingApplications ?? 0],
      ['Accepted', data.acceptedApplications ?? 0],
      ['Acceptance Rate (%)', data.acceptanceRate ?? 0],
      ['Fill Rate (%)', data.fillRate ?? 0],
      ['Bed Occupancy (%)', data.bedOccupancyRate ?? 0],
      ['Total Beds', data.totalBeds ?? 0],
      ['Available Beds', data.availableBeds ?? 0],
      ['ICU Beds', data.icuBeds ?? 0],
      [],
      ['Department', 'Vacancies', 'Applications', 'Accepted'],
      ...(data.topDepartments || []).map((d: any) => [d.department, d.vacancies, d.applications, d.accepted]),
    ];
    const csv  = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `hospital-analytics-${period}.csv`;
    document.body.appendChild(a); a.click();
    URL.revokeObjectURL(url); document.body.removeChild(a);
  };

  const kpis = [
    { label: 'Active Vacancies',    value: data.activeVacancies ?? 0,       emoji: '📋', color: 'from-blue-500 to-blue-700' },
    { label: 'Total Applications',  value: data.totalApplications ?? 0,     emoji: '👥', color: 'from-indigo-500 to-indigo-700' },
    { label: 'Pending Review',      value: data.pendingApplications ?? 0,   emoji: '⏳', color: 'from-yellow-500 to-yellow-700' },
    { label: 'Acceptance Rate',     value: `${data.acceptanceRate ?? 0}%`,  emoji: '✅', color: 'from-green-500 to-green-700' },
    { label: 'Vacancy Fill Rate',   value: `${data.fillRate ?? 0}%`,        emoji: '📈', color: 'from-teal-500 to-teal-700' },
    { label: 'Bed Occupancy',       value: `${data.bedOccupancyRate ?? 0}%`,emoji: '🛏️', color: 'from-purple-500 to-purple-700' },
    { label: 'Available Beds',      value: data.availableBeds ?? 0,         emoji: '🏥', color: 'from-cyan-500 to-cyan-700' },
    { label: 'Avg Rating',          value: `${(data.averageRating || 0).toFixed(1)} ⭐`, emoji: '⭐', color: 'from-orange-500 to-orange-700' },
  ];

  const trend      = data.vacancyTrend || [];
  const depts      = data.topDepartments || [];
  const maxTrend   = Math.max(...trend.map((t: any) => Math.max(t.vacancies || 0, t.applications || 0)), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Recruitment and facility performance overview</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {['week', 'month', 'quarter', 'year'].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  period === p ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
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
            Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      ) : (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
            {/* Application Status Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Status</h2>
              {(data.totalApplications ?? 0) === 0 ? (
                <div className="text-center py-8">
                  <p className="text-4xl mb-2">👥</p>
                  <p className="text-gray-500 text-sm">No applications in this period</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {[
                    { label: 'Pending',      count: data.pendingApplications ?? 0,      color: 'bg-yellow-400' },
                    { label: 'Shortlisted',  count: data.shortlistedApplications ?? 0,  color: 'bg-blue-500' },
                    { label: 'Accepted',     count: data.acceptedApplications ?? 0,     color: 'bg-green-500' },
                    { label: 'Rejected',     count: data.rejectedApplications ?? 0,     color: 'bg-red-500' },
                  ].map(({ label, count, color }) => {
                    const total = data.totalApplications || 1;
                    const pct   = (count / total) * 100;
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

            {/* Bed Capacity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Bed Capacity</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">Bed Occupancy</span>
                    <span className="text-gray-600">{data.bedOccupancyRate ?? 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all ${
                        (data.bedOccupancyRate ?? 0) > 85 ? 'bg-red-500' :
                        (data.bedOccupancyRate ?? 0) > 65 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${data.bedOccupancyRate ?? 0}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[
                    { label: 'Total Beds',     value: data.totalBeds ?? 0,     cls: 'bg-blue-50 text-blue-700' },
                    { label: 'Available',      value: data.availableBeds ?? 0, cls: 'bg-green-50 text-green-700' },
                    { label: 'ICU Beds',       value: data.icuBeds ?? 0,       cls: 'bg-red-50 text-red-700' },
                  ].map(({ label, value, cls }) => (
                    <div key={label} className={`rounded-xl p-3 text-center ${cls}`}>
                      <p className="text-2xl font-bold">{value}</p>
                      <p className="text-xs font-medium mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">All-Time Applications</span>
                    <span className="font-bold text-gray-900">{data.allTimeApplications ?? 0}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-600">Avg Rating</span>
                    <span className="font-bold text-gray-900">{(data.averageRating || 0).toFixed(1)} ⭐ ({data.totalReviews ?? 0} reviews)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 6-Month Trend */}
          {trend.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">6-Month Trend</h2>
              <div className="flex items-end gap-3 h-32">
                {trend.map((t: any, i: number) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex gap-1 items-end" style={{ height: '96px' }}>
                      <div className="flex-1 bg-blue-500 rounded-t-sm transition-all hover:bg-blue-600"
                        style={{ height: `${Math.max((t.vacancies / maxTrend) * 96, t.vacancies > 0 ? 4 : 0)}px` }}
                        title={`${t.vacancies} vacancies`} />
                      <div className="flex-1 bg-indigo-300 rounded-t-sm transition-all hover:bg-indigo-400"
                        style={{ height: `${Math.max((t.applications / maxTrend) * 96, t.applications > 0 ? 4 : 0)}px` }}
                        title={`${t.applications} applications`} />
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{t.label}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-500 rounded-sm" /><span className="text-xs text-gray-600">Vacancies</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-indigo-300 rounded-sm" /><span className="text-xs text-gray-600">Applications</span></div>
              </div>
            </div>
          )}

          {/* Department Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Department Breakdown</h2>
            {depts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-2">🏥</p>
                <p className="text-gray-500 text-sm">No vacancies posted yet in this period</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Department', 'Vacancies', 'Applications', 'Accepted', 'Conv. Rate'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {depts.map((d: any, i: number) => {
                      const rate = d.applications > 0 ? Math.round((d.accepted / d.applications) * 100) : 0;
                      return (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{d.department}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{d.vacancies}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{d.applications}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-green-600">{d.accepted}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[80px]">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${rate}%` }} />
                              </div>
                              <span className="text-xs text-gray-600">{rate}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
