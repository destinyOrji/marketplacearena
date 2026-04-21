import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardStats } from '../types';
import { analyticsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const DashboardHome: React.FC = () => {
  const { professional } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalEarnings: 0,
    pendingPayments: 0,
    upcomingAppointments: 0,
    activeServices: 0,
    completionRate: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi
      .getDashboardStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      title: 'Total Earnings',
      value: `$${stats.totalEarnings.toLocaleString()}`,
      bg: 'from-blue-500 to-blue-700',
      to: '/professional/payments',
    },
    {
      title: 'Pending Payments',
      value: `$${stats.pendingPayments.toLocaleString()}`,
      bg: 'from-yellow-500 to-yellow-700',
      to: '/professional/payments',
    },
    {
      title: 'Upcoming Appointments',
      value: stats.upcomingAppointments,
      bg: 'from-green-500 to-green-700',
      to: '/professional/appointments',
    },
    {
      title: 'Active Services',
      value: stats.activeServices,
      bg: 'from-purple-500 to-purple-700',
      to: '/professional/services',
    },
    {
      title: 'Completion Rate',
      value: `${stats.completionRate}%`,
      bg: 'from-teal-500 to-teal-700',
      to: undefined,
    },
    {
      title: 'Average Rating',
      value: stats.averageRating.toFixed(1),
      bg: 'from-orange-500 to-orange-700',
      to: undefined,
    },
  ];

  const quickActions = [
    { to: '/professional/services', label: 'Add Service', emoji: '➕' },
    { to: '/professional/jobs', label: 'Browse Jobs', emoji: '💼' },
    { to: '/professional/schedule', label: 'Set Schedule', emoji: '📅' },
    { to: '/professional/profile', label: 'Edit Profile', emoji: '👤' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">
          Welcome back, {professional?.fullName || 'Doctor'} 👋
        </h1>
        <p className="opacity-80 text-sm">
          {professional?.specialization?.[0] || 'Healthcare Professional'} &bull;{' '}
          <span className={professional?.verificationStatus === 'verified' ? 'text-green-300' : 'text-yellow-300'}>
            {professional?.verificationStatus === 'verified' ? '✓ Verified' : '⏳ Pending Verification'}
          </span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? [...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl bg-gray-200 animate-pulse h-28" />
            ))
          : statCards.map(({ title, value, bg, to }) => {
              const card = (
                <div className={`bg-gradient-to-br ${bg} rounded-xl p-6 text-white shadow-sm hover:shadow-lg transition-shadow`}>
                  <p className="text-sm font-medium opacity-90 mb-2">{title}</p>
                  <p className="text-3xl font-bold">{value}</p>
                </div>
              );
              return to ? (
                <Link key={title} to={to}>{card}</Link>
              ) : (
                <div key={title}>{card}</div>
              );
            })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {quickActions.map(({ to, label, emoji }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-center"
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Profile Completion */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Profile Completion</h2>
          <span className="text-sm font-medium text-blue-600">
            {professional?.completionPercentage ?? 0}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${professional?.completionPercentage ?? 0}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Complete your profile to attract more patients and job opportunities.
        </p>
        <Link
          to="/professional/profile"
          className="inline-block mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Complete Profile →
        </Link>
      </div>
    </div>
  );
};

export default DashboardHome;
