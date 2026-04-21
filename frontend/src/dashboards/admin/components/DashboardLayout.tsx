/**
 * Admin Dashboard Layout Component
 * Main layout wrapper with header, sidebar, and content area
 */
import React, { ReactNode, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FiMenu, FiBell, FiSearch, FiUser, FiLogOut } from 'react-icons/fi';
import Sidebar from './Sidebar';
import { useAdminAuth } from '../contexts/AdminAuthContext';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const location = useLocation();
  const { admin, logout } = useAdminAuth();

  const getPageTitle = () => {
    const path = location.pathname;
    
    // Map paths to titles
    const titleMap: { [key: string]: string } = {
      '/admin/overview': 'Overview',
      '/admin/patients': 'All Patients',
      '/admin/patients/profiles': 'Patient Profiles',
      '/admin/patients/appointments': 'Appointments',
      '/admin/patients/records': 'Medical Records',
      '/admin/patients/emergencies': 'Emergency Bookings',
      '/admin/professionals': 'All Professionals',
      '/admin/professionals/profiles': 'Professional Profiles',
      '/admin/professionals/services': 'Services',
      '/admin/professionals/applications': 'Job Applications',
      '/admin/professionals/schedules': 'Schedules',
      '/admin/professionals/earnings': 'Earnings',
      '/admin/professionals/verification': 'Professional Verification',
      '/admin/hospitals': 'All Hospitals',
      '/admin/hospitals/profiles': 'Hospital Profiles',
      '/admin/hospitals/vacancies': 'Job Vacancies',
      '/admin/hospitals/applications': 'Applications',
      '/admin/hospitals/subscriptions': 'Subscriptions',
      '/admin/hospitals/verification': 'Hospital Verification',
      '/admin/ambulances': 'All Providers',
      '/admin/ambulances/profiles': 'Provider Profiles',
      '/admin/ambulances/bookings': 'Emergency Bookings',
      '/admin/ambulances/fleet': 'Fleet Management',
      '/admin/ambulances/availability': 'Availability',
      '/admin/ambulances/verification': 'Ambulance Verification',
      '/admin/settings': 'Settings'
    };

    return titleMap[path] || 'Admin Dashboard';
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
          >
            <FiMenu className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="flex flex-1 justify-between px-4 sm:px-6 lg:px-8">
            {/* Page title */}
            <div className="flex flex-1 items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                {getPageTitle()}
              </h2>
            </div>

            {/* Header actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <button className="hidden md:flex items-center px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md">
                <FiSearch className="h-5 w-5 mr-2" />
                <span>Search...</span>
              </button>

              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100">
                <FiBell className="h-6 w-6" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
              </button>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-2 text-gray-700 hover:text-gray-900 rounded-md hover:bg-gray-100"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <FiUser className="h-5 w-5 text-white" />
                  </div>
                  <span className="hidden md:block text-sm font-medium">
                    {admin?.email?.split('@')[0] || 'Admin'}
                  </span>
                </button>

                {/* Profile dropdown menu */}
                {showProfileMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowProfileMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <FiLogOut className="mr-3 h-5 w-5 text-gray-400" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
