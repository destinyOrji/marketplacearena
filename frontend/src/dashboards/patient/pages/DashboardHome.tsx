import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DashboardLayout } from '../components';
import apiClient from '../services/apiClient';

const DashboardHome: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>({});
  const [subscription, setSubscription] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [statsRes, subRes, apptRes] = await Promise.allSettled([
        apiClient.get('/client/dashboard-stats'),
        apiClient.get('/subscriptions/status'),
        apiClient.get('/client/appointments?status=upcoming&limit=5'),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data?.data || {});
      if (subRes.status === 'fulfilled') setSubscription(subRes.value.data?.data || null);
      if (apptRes.status === 'fulfilled') {
        const d = apptRes.value.data?.data;
        setAppointments(Array.isArray(d) ? d : []);
      }
    } catch (e) {
      console.error('Dashboard load error', e);
    } finally {
      setLoading(false);
    }
  };

  const name = (user as any)?.firstName || user?.fullName || 'Patient';

  const statCards = [
    { label: 'Upcoming Appointments', value: stats.upcomingAppointments ?? appointments.length ?? 0, emoji: '📅', color: 'from-blue-500 to-blue-700', to: '/patient/appointments' },
    { label: 'Pending Payments', value: stats.pendingPayments ?? 0, emoji: '💳', color: 'from-green-500 to-green-700', to: '/patient/payments' },
    { label: 'Total Appointments', value: stats.totalAppointments ?? 0, emoji: '🏥', color: 'from-purple-500 to-purple-700', to: '/patient/appointments' },
    { label: 'Medical Records', value: stats.totalRecords ?? 0, emoji: '📋', color: 'from-teal-500 to-teal-700', to: '/patient/medical-records' },
  ];

  return (
    <DashboardLayout>
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome back, {name}! 👋</h1>
        <p className="text-gray-600 mt-1">Here's an overview of your healthcare activities</p>
      </div>

      {/* Subscription Banner */}
      {subscription && !subscription.hasActiveSubscription && (
        <div className="mb-6 bg-yellow-50 border-2 border-yellow-400 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-yellow-900">Subscription Required</h3>
            <p className="text-yellow-800 text-sm mt-1">Subscribe to book appointments and access emergency services</p>
          </div>
          <button onClick={() => navigate('/patient/subscription')}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-lg font-semibold text-sm self-start sm:self-auto">
            View Plans
          </button>
        </div>
      )}

      {subscription?.hasActiveSubscription && (
        <div className="mb-6 bg-green-50 border-2 border-green-400 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-green-900">✓ Active Subscription</h3>
            <p className="text-green-800 text-sm mt-1">
              Plan: <strong>{subscription.subscription?.plan}</strong> &bull; {subscription.daysRemaining} days remaining
            </p>
          </div>
          <button onClick={() => navigate('/patient/subscription')}
            className="text-green-700 hover:text-green-900 text-sm font-medium self-start sm:self-auto">
            Manage →
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loading
          ? [...Array(4)].map((_, i) => <div key={i} className="rounded-xl bg-gray-200 animate-pulse h-28" />)
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button onClick={() => navigate('/patient/browse-services')}
          className="bg-white border-2 border-blue-600 text-blue-600 rounded-xl p-6 hover:bg-blue-50 transition-colors flex items-center justify-between">
          <div className="text-left">
            <h3 className="text-lg font-semibold">Book Consultation</h3>
            <p className="text-sm text-gray-600 mt-1">Schedule with a healthcare professional</p>
          </div>
          <span className="text-3xl">🩺</span>
        </button>
        <button onClick={() => navigate('/patient/emergency')}
          className="bg-red-600 text-white rounded-xl p-6 hover:bg-red-700 transition-colors flex items-center justify-between">
          <div className="text-left">
            <h3 className="text-lg font-semibold">Call Ambulance</h3>
            <p className="text-sm text-red-100 mt-1">Request emergency medical transportation</p>
          </div>
          <span className="text-3xl">🚑</span>
        </button>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
          <Link to="/patient/appointments" className="text-blue-600 hover:text-blue-700 text-sm font-medium">View all →</Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-10">
            <span className="text-5xl">📅</span>
            <p className="text-gray-500 mt-3">No upcoming appointments</p>
            <button onClick={() => navigate('/patient/browse-services')}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-sm">
              Book Now
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((appt: any, i: number) => (
              <div key={appt.id || appt._id || i}
                className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">{appt.provider?.name || appt.professionalName || 'Healthcare Provider'}</p>
                  <p className="text-sm text-gray-500">{appt.date || appt.scheduledDate} {appt.time && `at ${appt.time}`}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  appt.type === 'video' ? 'bg-blue-100 text-blue-700' :
                  appt.type === 'chat' ? 'bg-green-100 text-green-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {appt.type || appt.appointmentType || 'In-person'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardHome;
