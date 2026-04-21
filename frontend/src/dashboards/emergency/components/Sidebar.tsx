// Sidebar Navigation Component

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { EmergencyProvider } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  provider: EmergencyProvider | null;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, provider }) => {
  const location = useLocation();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/ambulance/dashboard', icon: '🏠' },
    { id: 'profile', label: 'Profile', path: '/ambulance/profile', icon: '👤' },
    { id: 'services', label: 'My Services', path: '/ambulance/services', icon: '🚑' },
    { id: 'active', label: 'Active Emergency', path: '/ambulance/active-emergency', icon: '🚨' },
    { id: 'bookings', label: 'Booking History', path: '/ambulance/bookings', icon: '📋' },
    { id: 'earnings', label: 'Earnings', path: '/ambulance/earnings', icon: '💰' },
    { id: 'coverage', label: 'Coverage Areas', path: '/ambulance/coverage', icon: '🗺️' },
    { id: 'vehicles', label: 'Vehicles & Equipment', path: '/ambulance/vehicles', icon: '🚗' },
    { id: 'analytics', label: 'Analytics', path: '/ambulance/analytics', icon: '📊' },
    { id: 'settings', label: 'Settings', path: '/ambulance/settings', icon: '⚙️' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Provider Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {provider?.profilePhoto ? (
              <img
                src={provider.profilePhoto}
                alt={provider.organizationName}
                className="w-12 h-12 rounded-full"
                loading="lazy"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-600 font-semibold text-lg">
                  {provider?.organizationName?.charAt(0) || 'E'}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">
                {provider?.organizationName || 'Emergency Provider'}
              </p>
              <p className="text-sm text-gray-600 truncate">{provider?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-120px)]">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-red-50 text-red-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
