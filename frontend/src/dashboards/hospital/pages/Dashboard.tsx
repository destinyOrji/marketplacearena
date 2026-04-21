/**
 * Hospital Dashboard Home Page
 */
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiFileText, 
  FiCheckCircle, 
  FiClock,
  FiTrendingUp,
  FiPlus
} from 'react-icons/fi';
import { useHospital } from '../contexts/HospitalContext';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const { hospital, dashboardStats, loading, refreshDashboardStats } = useHospital();

  useEffect(() => {
    refreshDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Unable to load hospital data</p>
      </div>
    );
  }

  // Show onboarding alert if not completed
  if (!hospital.onboarding_completed) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiClock className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-yellow-800">
                Complete Your Onboarding
              </h3>
              <p className="mt-2 text-sm text-yellow-700">
                Please complete your hospital profile to start posting job vacancies and accessing all features.
              </p>
              <div className="mt-4">
                <Link
                  to="/hospital/onboarding"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200"
                >
                  Complete Onboarding
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Active Vacancies',
      value: dashboardStats?.active_vacancies || 0,
      icon: FiFileText,
      color: 'bg-blue-500',
      link: '/hospital/vacancies',
    },
    {
      name: 'Total Applications',
      value: dashboardStats?.total_applications || 0,
      icon: FiFileText,
      color: 'bg-green-500',
      link: '/hospital/applications',
    },
    {
      name: 'Pending Review',
      value: dashboardStats?.pending_applications || 0,
      icon: FiClock,
      color: 'bg-yellow-500',
      link: '/hospital/applications?status=pending',
    },
    {
      name: 'Total Vacancies',
      value: dashboardStats?.total_vacancies || 0,
      icon: FiTrendingUp,
      color: 'bg-purple-500',
      link: '/hospital/vacancies',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome back, {hospital.hospital_name}!
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Here's what's happening with your job postings today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              to={stat.link}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="text-3xl font-semibold text-gray-900">
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/hospital/vacancies/new"
            className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <FiPlus className="h-6 w-6 text-blue-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">Post New Vacancy</span>
          </Link>
          <Link
            to="/hospital/applications?status=pending"
            className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <FiFileText className="h-6 w-6 text-green-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">Review Applications</span>
          </Link>
          <Link
            to="/hospital/profile"
            className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
          >
            <FiCheckCircle className="h-6 w-6 text-purple-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">Update Profile</span>
          </Link>
        </div>
      </div>

      {/* Recent Applications */}
      {dashboardStats?.recent_applications && dashboardStats.recent_applications.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Applications</h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {dashboardStats.recent_applications.map((application) => (
              <li key={application.application_id}>
                <Link
                  to={`/hospital/applications/${application.application_id}`}
                  className="block hover:bg-gray-50 transition-colors"
                >
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {application.professional_name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {application.vacancy_title} • {application.professional_type}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0 flex items-center space-x-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            application.application_status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : application.application_status === 'reviewed'
                              ? 'bg-blue-100 text-blue-800'
                              : application.application_status === 'shortlisted'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {application.application_status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(application.applied_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <div className="px-6 py-3 bg-gray-50 text-right">
            <Link
              to="/hospital/applications"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View all applications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
