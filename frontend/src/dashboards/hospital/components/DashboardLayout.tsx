/**
 * Dashboard Layout Component
 * Main layout wrapper for hospital dashboard
 */
import React, { ReactNode } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  FiHome, 
  FiUser, 
  FiFileText, 
  FiCreditCard,
  FiMenu,
  FiX,
  FiBell,
  FiLogOut
} from 'react-icons/fi';
import { useHospital } from '../contexts/HospitalContext';

interface DashboardLayoutProps {
  children?: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const location = useLocation();
  const { hospital } = useHospital();

  const navigation = [
    { name: 'Dashboard', href: '/hospital/dashboard', icon: FiHome },
    { name: 'Profile', href: '/hospital/profile', icon: FiUser },
    { name: 'Vacancies', href: '/hospital/vacancies', icon: FiFileText },
    { name: 'Applications', href: '/hospital/applications', icon: FiFileText },
    { name: 'Billing', href: '/hospital/billing', icon: FiCreditCard },
  ];

  const isActive = (path: string) => location.pathname === path;

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
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b">
            <h1 className="text-xl font-bold text-blue-600">Hospital Portal</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>

          {/* Hospital Info */}
          {hospital && (
            <div className="px-6 py-4 border-b">
              <p className="text-sm font-medium text-gray-900 truncate">
                {hospital.hospital_name}
              </p>
              <p className="text-xs text-gray-500">{hospital.city}, {hospital.state}</p>
              <span
                className={`inline-flex mt-2 items-center px-2 py-1 rounded-full text-xs font-medium ${
                  hospital.verification_status === 'verified'
                    ? 'bg-green-100 text-green-800'
                    : hospital.verification_status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {hospital.verification_status}
              </span>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="border-t px-3 py-4">
            <button
              onClick={() => {
                localStorage.removeItem('hospitalToken');
                localStorage.removeItem('hospital');
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                window.location.href = '/auth/login';
              }}
              className="flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-gray-900"
            >
              <FiLogOut className="mr-3 h-5 w-5 text-gray-400" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
          >
            <FiMenu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex flex-1 items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                {navigation.find((item) => isActive(item.href))?.name || 'Hospital Dashboard'}
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-500">
                <FiBell className="h-6 w-6" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children ?? <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
