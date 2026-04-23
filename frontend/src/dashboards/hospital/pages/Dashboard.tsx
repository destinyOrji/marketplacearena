import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiFileText, FiClock, FiTrendingUp, FiPlus, FiCheckCircle, FiUsers } from 'react-icons/fi';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [hospital, setHospital] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const token = localStorage.getItem('hospitalToken') || localStorage.getItem('authToken');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [profileRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/hospitals/profile`, { headers }),
        axios.get(`${API_URL}/hospitals/dashboard-stats`, { headers }),
      ]);
      setHospital(profileRes.data?.data || profileRes.data);
      setStats(statsRes.data?.data || statsRes.data);
    } catch (e) {
      console.error('Failed to load hospital dashboard', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );

  const h = hospital || {};
  const s = stats || {};
  const hospitalName = h.hospitalName || h.hospital_name || 'Hospital';
  const isVerified = h.isVerified || h.verification_status === 'verified';

  const statCards = [
    { name: 'Active Vacancies', value: s.active_vacancies ?? s.activeVacancies ?? 0, icon: FiFileText, color: 'bg-blue-500', link: '/hospital/vacancies' },
    { name: 'Total Applications', value: s.total_applications ?? s.totalApplications ?? 0, icon: FiUsers, color: 'bg-green-500', link: '/hospital/applications' },
    { name: 'Pending Review', value: s.pending_applications ?? s.pendingApplications ?? 0, icon: FiClock, color: 'bg-yellow-500', link: '/hospital/applications' },
    { name: 'Total Vacancies', value: s.total_vacancies ?? s.totalVacancies ?? 0, icon: FiTrendingUp, color: 'bg-purple-500', link: '/hospital/vacancies' },
    { name: 'Total Beds', value: s.totalBeds ?? 0, icon: FiCheckCircle, color: 'bg-indigo-500', link: '/hospital/profile' },
    { name: 'Available Beds', value: s.availableBeds ?? 0, icon: FiCheckCircle, color: 'bg-teal-500', link: '/hospital/profile' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">Welcome back, {hospitalName} 👋</h1>
        <p className="opacity-80 text-sm">
          {h.hospitalType || 'Hospital'} &bull;{' '}
          <span className={isVerified ? 'text-green-300' : 'text-yellow-300'}>
            {isVerified ? '✓ Verified' : '⏳ Pending Verification'}
          </span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map(({ name, value, icon: Icon, color, link }) => (
          <Link key={name} to={link}
            className="bg-white overflow-hidden shadow rounded-xl hover:shadow-md transition-shadow">
            <div className="p-5 flex items-center">
              <div className={`flex-shrink-0 rounded-lg p-3 ${color}`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">{name}</p>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link to="/hospital/vacancies/new"
            className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <FiPlus className="h-6 w-6 text-blue-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">Post New Vacancy</span>
          </Link>
          <Link to="/hospital/applications"
            className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
            <FiFileText className="h-6 w-6 text-green-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">Review Applications</span>
          </Link>
          <Link to="/hospital/profile"
            className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
            <FiCheckCircle className="h-6 w-6 text-purple-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">Update Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
