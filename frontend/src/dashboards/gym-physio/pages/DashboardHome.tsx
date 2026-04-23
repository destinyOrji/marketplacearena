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
      .then(d => setStats(d || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const name = gymPhysio?.businessName || 'My Business';
  const isVerified = gymPhysio?.isVerified || stats.isVerified;

  const statCards = [
    {
      label: 'Active Services',
      value: stats.activeServices ?? 0,
      emoji: '💪',
      color: 'from-orange-500 to-orange-700',
      to: '/gym-physio/services',
    },
    {
      label: 'Upcoming Appointments',
      value: stats.upcomingAppointments ?? 0,
      emoji: '📅',
      color: 'from-blue-500 to-blue-700',
      to: '/gym-physio/appointments',
    },
    {
      label: 'Completed Sessions',
      value: stats.completedBookings ?? 0,
      emoji: '✅',
      color: 'from-green-500 to-green-700',
      to: '/gym-physio/appointments',
    },
    {
      label: 'Completion Rate',
      value: `${stats.completionRate ?? 0}%`,
      emoji: '📊',
      color: 'from-teal-500 to-teal-700',
      to: '/gym-physio/analytics',
    },
    {
      label: 'Average Rating',
      value: (stats.averageRating || 0).toFixed(1),
      emoji: '⭐',
      color: 'from-yellow-500 to-yellow-700',
      to: '/gym-physio/analytics',
    },
    {
      label: 'Total Reviews',
      value: stats.totalReviews ?? 0,
      emoji: '💬',
      color: 'from-purple-500 to-purple-700',
      to: '/gym-physio/analytics',
    },
  ];

  const quickActions = [
    { to: '/gym-physio/services', label: 'Add Service', emoji: '➕' },
    { to: '/gym-physio/appointments', label: 'Appointments', emoji: '📅' },
    { to: '/gym-physio/schedule', label: 'Set Schedule', emoji: '⏰' },
    { to: '/gym-physio/profile', label: 'Edit Profile', emoji: '👤' },
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
          ? [...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl bg-gray-200 animate-pulse h-28" />
            ))
          : statCards.map(({ label, value, emoji, color, to }) => (
              <Link key={label} to={to}
                className={`bg-gradient-to-br ${color} rounded-xl p-6 text-white shadow-sm hover:shadow-lg transition-shadow`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium opacity-90">{label}</p>
                  <span className="text-2xl">{emoji}</span>
                </div>
                <p className="text-3xl font-bold">{value}</p>
              </Link>
            ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {quickActions.map(({ to, label, emoji }) => (
            <Link key={to} to={to}
              className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors text-center">
              <span className="text-2xl">{emoji}</span>
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Verification Notice */}
      {!isVerified && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-yellow-900">Verification Pending</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Your account is pending admin verification. Complete your profile to speed up the process.
              </p>
              <Link to="/gym-physio/profile" className="inline-block mt-2 text-sm text-orange-600 font-medium hover:underline">
                Complete Profile →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;
