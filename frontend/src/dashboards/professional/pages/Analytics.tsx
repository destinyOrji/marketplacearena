// Analytics Page - Performance metrics and insights

import React, { useState, useEffect } from 'react';
import { PerformanceMetrics, DashboardStats } from '../types';
import { analyticsApi } from '../services/api';
import { toast } from 'react-toastify';

const Analytics: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    fetchMetrics();
  }, [period]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/professionals/analytics', { params: { period } });
      const data = response.data?.data || response.data;
      setMetrics({
        totalAppointments: data?.totalAppointments || 0,
        completionRate: data?.completionRate || 0,
        averageRating: data?.averageRating || 0,
        totalReviews: data?.totalReviews || 0,
        responseTime: data?.responseTime || 0,
        popularServices: data?.popularServices || [],
      });
    } catch (error) {
      setMetrics({ totalAppointments: 0, completionRate: 0, averageRating: 0, totalReviews: 0, responseTime: 0, popularServices: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'csv') => {
    try {
      const blob = await analyticsApi.exportReport(format, period);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${period}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics</h1>
            <p className="text-gray-600">View your performance metrics and business insights</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('pdf')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Export PDF
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex gap-2">
          {['week', 'month', 'quarter', 'year'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : metrics ? (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Total Appointments</h3>
              <p className="text-3xl font-bold text-gray-900">{metrics.totalAppointments}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Completion Rate</h3>
              <p className="text-3xl font-bold text-gray-900">{metrics.completionRate}%</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Average Rating</h3>
              <p className="text-3xl font-bold text-gray-900">{metrics.averageRating.toFixed(1)}</p>
              <p className="text-sm text-gray-600 mt-1">{metrics.totalReviews} reviews</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Response Time</h3>
              <p className="text-3xl font-bold text-gray-900">{metrics.responseTime}h</p>
            </div>
          </div>

          {/* Popular Services */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Popular Services</h2>
            {metrics.popularServices.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No service data available</p>
            ) : (
              <div className="space-y-4">
                {metrics.popularServices.map((service, index) => (
                  <div key={service.serviceId} className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{service.serviceName}</h4>
                      <p className="text-sm text-gray-600">
                        {service.bookings} bookings • ${service.revenue.toLocaleString()} revenue
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(service.bookings / metrics.popularServices[0].bookings) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-600">No analytics data available</p>
        </div>
      )}
    </div>
  );
};

export default Analytics;
