/**
 * Admin Overview Page
 * Main dashboard page with analytics and statistics
 */
import React, { useEffect, useState } from 'react';
import {
  FiUsers,
  FiUserCheck,
  FiActivity,
  FiTruck,
  FiCalendar,
  FiCheckCircle,
  FiDollarSign,
  FiAlertCircle
} from 'react-icons/fi';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { dashboardService } from '../services/dashboardService';
import {
  StatsCard,
  RecentActivities,
  RegistrationTrendsChart,
  AppointmentStatsChart,
  EmergencyBookingsChart,
  RevenueDistributionChart
} from '../components';
import {
  DashboardStats,
  RegistrationTrend,
  AppointmentStats,
  EmergencyStats,
  RevenueDistribution,
  RecentActivity
} from '../types/dashboard';

const Overview: React.FC = () => {
  const { admin } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [registrationTrends, setRegistrationTrends] = useState<RegistrationTrend[]>([]);
  const [appointmentStats, setAppointmentStats] = useState<AppointmentStats[]>([]);
  const [emergencyStats, setEmergencyStats] = useState<EmergencyStats[]>([]);
  const [revenueDistribution, setRevenueDistribution] = useState<RevenueDistribution[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all dashboard data in parallel
      const [
        statsData,
        trendsData,
        appointmentsData,
        emergencyData,
        revenueData,
        activitiesData
      ] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRegistrationTrends(),
        dashboardService.getAppointmentStats(),
        dashboardService.getEmergencyStats(),
        dashboardService.getRevenueDistribution(),
        dashboardService.getRecentActivities()
      ]);

      setStats(statsData);
      setRegistrationTrends(trendsData);
      setAppointmentStats(appointmentsData);
      setEmergencyStats(emergencyData);
      setRevenueDistribution(revenueData);
      setRecentActivities(activitiesData);
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <FiAlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <p className="text-red-800">{error}</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {admin?.email?.split('@')[0] || 'Admin'}
        </h1>
        <p className="text-gray-600 mt-1">Here's what's happening with your platform today.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Hospitals"
          value={stats?.total_hospitals || 0}
          icon={FiActivity}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatsCard
          title="Total Professionals"
          value={stats?.total_professionals || 0}
          icon={FiUserCheck}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatsCard
          title="Total Patients"
          value={stats?.total_patients || 0}
          icon={FiUsers}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />
        <StatsCard
          title="Total Ambulances"
          value={stats?.total_ambulances || 0}
          icon={FiTruck}
          iconBgColor="bg-orange-100"
          iconColor="text-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Active Appointments"
          value={stats?.active_appointments || 0}
          icon={FiCalendar}
          iconBgColor="bg-indigo-100"
          iconColor="text-indigo-600"
        />
        <StatsCard
          title="Pending Verifications"
          value={stats?.pending_verifications || 0}
          icon={FiCheckCircle}
          iconBgColor="bg-yellow-100"
          iconColor="text-yellow-600"
        />
        <StatsCard
          title="Total Revenue"
          value={`$${(stats?.total_revenue || 0).toLocaleString()}`}
          icon={FiDollarSign}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />
        <StatsCard
          title="Emergency Bookings"
          value={stats?.emergency_bookings || 0}
          icon={FiTruck}
          iconBgColor="bg-red-100"
          iconColor="text-red-600"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RegistrationTrendsChart data={registrationTrends} />
        <AppointmentStatsChart data={appointmentStats} />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <EmergencyBookingsChart data={emergencyStats} />
        <RevenueDistributionChart data={revenueDistribution} />
      </div>

      {/* Recent Activities */}
      <RecentActivities
        activities={recentActivities}
        onRefresh={fetchDashboardData}
        isLoading={loading}
      />
    </div>
  );
};

export default Overview;
