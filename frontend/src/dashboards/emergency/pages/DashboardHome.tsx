import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/apiClient';

const DashboardHome: React.FC = () => {
  const { provider } = useAuth() as any;
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/ambulance/dashboard-stats')
      .then(res => setStats(res.data?.data || res.data || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const name = provider?.serviceName || (provider as any)?.organizationName || 'Ambulance Service';
  const isVerified = provider?.isVerified || (provider as any)?.verificationStatus === 'verified';

  const statCards = [
    { label: 'Total Bookings', value: stats.totalBookings ?? 0, emoji: '🚑', color: 'from-red-500 to-red-700' },
    { label: 'Completed', value: stats.completedBookings ?? 0, emoji: '✅', color: 'from-green-500 to-green-700' },
    { label: 'Active Vehicles', value: stats.activeVehicles ?? 0, emoji: '🚗', color: 'from-blue-500 to-blue-700' },
    { label: 'Avg Response Time', value: stats.averageResponseTime ? `${stats.averageResponseTime}min` : 'N/A', emoji: '⏱️', color: 'from-yellow-500 to-yellow-700' },
    { label: 'Average Rating', value: (stats.averageRating || 0).toFixed(1), emoji: '⭐', color: 'from-orange-500 to-orange-700' },
    { label: 'Total Reviews', value: stats.totalReviews ?? 0, emoji: '💬', color: 'from-purple-500 to-purple-700' },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">Welcome back, {name} 👋</h1>
        <p className="opacity-80 text-sm">
          Emergency Services &bull;{' '}
          <span className={isVerified ? 'text-green-300' : 'text-yellow-300'}>
            {isVerified ? '✓ Verified' : '⏳ Pending Verification'}
          </span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? [...Array(6)].map((_, i) => <div key={i} className="rounded-xl bg-gray-200 animate-pulse h-28" />)
          : statCards.map(({ label, value, emoji, color }) => (
              <div key={label} className={`bg-gradient-to-br ${color} rounded-xl p-6 text-white shadow-sm`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium opacity-90">{label}</p>
                  <span className="text-2xl">{emoji}</span>
                </div>
                <p className="text-3xl font-bold">{value}</p>
              </div>
            ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { to: '/emergency/bookings', label: 'View Bookings', emoji: '📋' },
            { to: '/emergency/vehicles', label: 'Manage Vehicles', emoji: '🚗' },
            { to: '/emergency/profile', label: 'Edit Profile', emoji: '👤' },
            { to: '/emergency/settings', label: 'Settings', emoji: '⚙️' },
          ].map(({ to, label, emoji }) => (
            <Link key={to} to={to}
              className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors text-center">
              <span className="text-2xl">{emoji}</span>
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
