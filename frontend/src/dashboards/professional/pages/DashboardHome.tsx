import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/apiClient';

const DashboardHome: React.FC = () => {
  const { professional } = useAuth();
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/professionals/dashboard-stats')
      .then(res => setStats(res.data?.data || res.data || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const name = professional?.fullName || (professional as any)?.firstName || 'Doctor';
  const specialization = Array.isArray(professional?.specialization)
    ? professional.specialization[0]
    : (professional as any)?.specialization || 'Healthcare Professional';
  const isVerified = professional?.verificationStatus === 'verified' || (professional as any)?.isVerified;

  const statCards = [
    { title: 'Total Earnings', value: `₦${(stats.totalEarnings || 0).toLocaleString()}`, bg: 'from-blue-500 to-blue-700', to: '/professional/payments', emoji: '💰' },
    { title: 'Pending Payments', value: `₦${(stats.pendingPayments || 0).toLocaleString()}`, bg: 'from-yellow-500 to-yellow-700', to: '/professional/payments', emoji: '⏳' },
    { title: 'Upcoming Appointments', value: stats.upcomingAppointments || 0, bg: 'from-green-500 to-green-700', to: '/professional/appointments', emoji: '📅' },
    { title: 'Active Services', value: stats.activeServices || 0, bg: 'from-purple-500 to-purple-700', to: '/professional/services', emoji: '🏥' },
    { title: 'Completion Rate', value: `${stats.completionRate || 0}%`, bg: 'from-teal-500 to-teal-700', to: undefined, emoji: '✅' },
    { title: 'Average Rating', value: (stats.averageRating || 0).toFixed(1), bg: 'from-orange-500 to-orange-700', to: undefined, emoji: '⭐' },
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
        <h1 className="text-2xl font-bold mb-1">Welcome back, {name} 👋</h1>
        <p className="opacity-80 text-sm">
          {specialization} &bull;{' '}
          <span className={isVerified ? 'text-green-300' : 'text-yellow-300'}>
            {isVerified ? '✓ Verified' : '⏳ Pending Verification'}
          </span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? [...Array(6)].map((_, i) => <div key={i} className="rounded-xl bg-gray-200 animate-pulse h-28" />)
          : statCards.map(({ title, value, bg, to, emoji }) => {
              const card = (
                <div className={`bg-gradient-to-br ${bg} rounded-xl p-6 text-white shadow-sm hover:shadow-lg transition-shadow`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium opacity-90">{title}</p>
                    <span className="text-2xl">{emoji}</span>
                  </div>
                  <p className="text-3xl font-bold">{value}</p>
                </div>
              );
              return to ? <Link key={title} to={to}>{card}</Link> : <div key={title}>{card}</div>;
            })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {quickActions.map(({ to, label, emoji }) => (
            <Link key={to} to={to}
              className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-center">
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
            {professional?.completionPercentage ?? stats.profileCompletion ?? 0}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${professional?.completionPercentage ?? stats.profileCompletion ?? 0}%` }} />
        </div>
        <p className="text-sm text-gray-500 mt-2">Complete your profile to attract more patients and job opportunities.</p>
        <Link to="/professional/profile" className="inline-block mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium">
          Complete Profile →
        </Link>
      </div>
    </div>
  );
};

export default DashboardHome;
