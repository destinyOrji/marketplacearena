import React, { useEffect, useState } from 'react';
import {
  FiUsers, FiUserCheck, FiActivity, FiTruck,
  FiCalendar, FiCheckCircle, FiAlertCircle
} from 'react-icons/fi';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { dashboardService } from '../services/dashboardService';
import {
  StatsCard, RecentActivities, RegistrationTrendsChart,
  AppointmentStatsChart, EmergencyBookingsChart, RevenueDistributionChart
} from '../components';

const Overview: React.FC = () => {
  const { admin } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [registrationTrends, setRegistrationTrends] = useState<any[]>([]);
  const [appointmentStats, setAppointmentStats] = useState<any[]>([]);
  const [emergencyStats, setEmergencyStats] = useState<any[]>([]);
  const [revenueDistribution, setRevenueDistribution] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Get admin name from localStorage
  const adminProfile = (() => {
    try { return JSON.parse(localStorage.getItem('admin_profile') || '{}'); } catch { return {}; }
  })();
  const adminName = adminProfile.firstName || adminProfile.email?.split('@')[0] || admin?.email?.split('@')[0] || 'Admin';

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, trendsData, appointmentsData, emergencyData, revenueData, activitiesData] = await Promise.all([
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

  useEffect(() => { fetchDashboardData(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center">
        <FiAlertCircle className="h-5 w-5 text-red-600 mr-2" />
        <p className="text-red-800">{error}</p>
      </div>
      <button onClick={fetchDashboardData} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
        Retry
      </button>
    </div>
  );

  // Normalize stats - backend returns camelCase
  const s = stats || {};
  const totalHospitals = s.totalHospitals ?? s.total_hospitals ?? 0;
  const totalProfessionals = s.totalProfessionals ?? s.total_professionals ?? 0;
  const totalPatients = s.totalPatients ?? s.total_patients ?? 0;
  const totalAmbulances = s.totalAmbulances ?? s.total_ambulances ?? 0;
  const totalAppointments = s.appointments?.total ?? s.active_appointments ?? 0;
  const todayAppointments = s.appointments?.today ?? 0;
  const pendingVerifications = s.pendingVerifications?.total ?? s.pending_verifications ?? 0;
  const recentRegistrations = s.recentRegistrations ?? 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {adminName} 👋</h1>
        <p className="text-gray-600 mt-1">Here's what's happening with your platform today.</p>
      </div>

      {/* Row 1 - User Counts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard title="Total Patients" value={totalPatients} icon={FiUsers} iconBgColor="bg-green-100" iconColor="text-green-600" />
        <StatsCard title="Total Professionals" value={totalProfessionals} icon={FiUserCheck} iconBgColor="bg-blue-100" iconColor="text-blue-600" />
        <StatsCard title="Total Hospitals" value={totalHospitals} icon={FiActivity} iconBgColor="bg-purple-100" iconColor="text-purple-600" />
        <StatsCard title="Total Ambulances" value={totalAmbulances} icon={FiTruck} iconBgColor="bg-orange-100" iconColor="text-orange-600" />
      </div>

      {/* Row 2 - Activity Counts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard title="Total Appointments" value={totalAppointments} icon={FiCalendar} iconBgColor="bg-indigo-100" iconColor="text-indigo-600" />
        <StatsCard title="Today's Appointments" value={todayAppointments} icon={FiCalendar} iconBgColor="bg-cyan-100" iconColor="text-cyan-600" />
        <StatsCard title="Pending Verifications" value={pendingVerifications} icon={FiCheckCircle} iconBgColor="bg-yellow-100" iconColor="text-yellow-600" />
        <StatsCard title="New This Month" value={recentRegistrations} icon={FiUsers} iconBgColor="bg-pink-100" iconColor="text-pink-600" />
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
      <RecentActivities activities={recentActivities} onRefresh={fetchDashboardData} isLoading={loading} />
    </div>
  );
};

export default Overview;
