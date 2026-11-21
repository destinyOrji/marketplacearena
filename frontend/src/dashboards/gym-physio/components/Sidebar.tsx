/**
 * Gym & Physio Sidebar Component
 */
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  FiHome, FiUser, FiPackage, FiCalendar, FiClipboard,
  FiVideo, FiClock, FiDollarSign, FiBarChart2, FiSettings, FiLogOut, FiX,
} from 'react-icons/fi';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems: NavItem[] = [
  { id: 'dashboard',         label: 'Dashboard',       icon: FiHome,     path: '/gym-physio/dashboard' },
  { id: 'profile',           label: 'Profile',         icon: FiUser,     path: '/gym-physio/profile' },
  { id: 'services',          label: 'My Services',     icon: FiPackage,  path: '/gym-physio/services' },
  { id: 'appointments',      label: 'Appointments',    icon: FiCalendar, path: '/gym-physio/appointments' },
  { id: 'client-records',    label: 'Client Records',  icon: FiClipboard,path: '/gym-physio/client-records' },
  { id: 'record-sessions',   label: 'Record Sessions', icon: FiVideo,    path: '/gym-physio/record-appointment' },
  { id: 'schedule',          label: 'Schedule',        icon: FiClock,    path: '/gym-physio/schedule' },
  { id: 'payments',          label: 'Payments',        icon: FiDollarSign, path: '/gym-physio/payments' },
  { id: 'analytics',         label: 'Analytics',       icon: FiBarChart2,  path: '/gym-physio/analytics' },
  { id: 'settings',          label: 'Settings',        icon: FiSettings, path: '/gym-physio/settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { gymPhysio, logout } = useAuth();

  const API_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'https://healthmarketarena.com';
  const profilePhoto = gymPhysio?.profilePicture ? `${API_URL}${gymPhysio.profilePicture}` : null;

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const initials = gymPhysio?.businessName
    ? gymPhysio.businessName.charAt(0).toUpperCase()
    : 'G';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg flex flex-col
          transform transition-transform duration-300 ease-in-out lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b flex-shrink-0">
          <h1 className="text-xl font-bold text-blue-600">Gym & Physio</h1>
          <button onClick={onClose} className="lg:hidden p-1 rounded-md text-gray-500 hover:bg-gray-100">
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Profile card */}
        <div className="px-4 py-3 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt={gymPhysio?.businessName || 'Profile'}
                className="w-9 h-9 rounded-full object-cover flex-shrink-0 border-2 border-blue-100"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-semibold">{initials}</span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {gymPhysio?.businessName || 'My Business'}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {gymPhysio?.businessType || 'Gym / Physio'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={onClose}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  active
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
                {item.label}
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
