/**
 * Patient Sidebar Component
 */
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiHome, FiSearch, FiZap, FiCalendar, FiAlertTriangle,
  FiFileText, FiCreditCard, FiMessageSquare, FiUser, FiLogOut, FiX,
} from 'react-icons/fi';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: number;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems: NavItem[] = [
  { id: 'dashboard',        label: 'Dashboard',            icon: FiHome,          path: '/patient/dashboard' },
  { id: 'browse-services',  label: 'Browse Professionals', icon: FiSearch,        path: '/patient/browse-services' },
  { id: 'browse-gym',       label: 'Browse Gym & Physio',  icon: FiZap,           path: '/patient/browse-gym-physio' },
  { id: 'appointments',     label: 'Appointments',         icon: FiCalendar,      path: '/patient/appointments' },
  { id: 'emergency',        label: 'Emergency',            icon: FiAlertTriangle, path: '/patient/emergency' },
  { id: 'records',          label: 'Records',              icon: FiFileText,      path: '/patient/medical-records' },
  { id: 'payments',         label: 'Payments',             icon: FiCreditCard,    path: '/patient/payments' },
  { id: 'feedback',         label: 'Feedback',             icon: FiMessageSquare, path: '/patient/feedback' },
  { id: 'profile',          label: 'Profile',              icon: FiUser,          path: '/patient/profile' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('patientToken');
    localStorage.removeItem('user');
    window.location.href = '/auth/login';
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg flex flex-col
          transform transition-transform duration-300 ease-in-out lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Main navigation"
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b flex-shrink-0">
          <h1 className="text-xl font-bold text-blue-600">Patient Portal</h1>
          <button onClick={onClose} className="lg:hidden p-1 rounded-md text-gray-500 hover:bg-gray-100" aria-label="Close sidebar">
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5" aria-label="Dashboard sections">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={onClose}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  active
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
                {item.label}
                {item.badge && item.badge > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t px-3 py-4 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <FiLogOut className="mr-3 h-5 w-5 text-gray-400" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
