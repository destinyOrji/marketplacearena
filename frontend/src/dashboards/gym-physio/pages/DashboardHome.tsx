import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardStats } from '../services/api';

const DashboardHome: React.FC = () => {
  const { gymPhysio } = useAuth();
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(data => setStats(data || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const name = gymPhysio?.businessName || 'Business';
  const isVerified = gymPhysio?.isVerified;

  const statCards = [
    { label: 'Total Bookings', value: stats.totalBookings ?? 0, emoji: '📅', color: 'bg-orange-100 text-orange-600' },
    { label: 'Completed Bookings', value: stats.completedBookings ?? 0, emoji: '✅', color: 'bg-green-100 text-green-600' },
    { label: 'Active Services', value: stats.activeServices ?? 0, emoji: '💪', color: 'bg-blue-100 text-blue-600' },
    { label: 'Average Rating', value: (stats.averageRating || 0).toFixed(1), emoji: '⭐', color: 'bg-yellow-100 text-yellow-600' },
    { label: 'Total Earnings', value: `₦${(stats.totalEarnings || 0).toLocaleString()}`, emoji: '💰', color: 'bg-purple-100 text-purple-600' },
    { label: 'Total Reviews', value: stats.totalReviews ?? 0, emoji: '💬', color: 'bg-pink-100 text-pink-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">Welcome back, {name} 👋</h1>
        <p className="opacity-80 text-sm">
          {gymPhysio?.businessType || 'Gym/Physio'} &bull;{' '}
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
              <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { to: '/gym-physio/services', label: 'Add Service', emoji: '➕' },
            { to: '/gym-physio/appointments', label: 'Appointments', emoji: '📅' },
            { to: '/gym-physio/schedule', label: 'Schedule', emoji: '🗓️' },
            { to: '/gym-physio/profile', label: 'Edit Profile', emoji: '👤' },
          ].map(({ to, label, emoji }) => (
            <Link key={to} to={to}
              className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors text-center">
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
