import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { gymPhysio, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/gym-physio/dashboard', icon: '🏠' },
    { name: 'Profile', path: '/gym-physio/profile', icon: '👤' },
    { name: 'My Services', path: '/gym-physio/services', icon: '💪' },
    { name: 'Appointments', path: '/gym-physio/appointments', icon: '📅' },
    { name: 'Schedule', path: '/gym-physio/schedule', icon: '⏰' },
    { name: 'Payments', path: '/gym-physio/payments', icon: '💰' },
    { name: 'Analytics', path: '/gym-physio/analytics', icon: '📊' },
    { name: 'Settings', path: '/gym-physio/settings', icon: '⚙️' },
  ];

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const isActiveRoute = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar - fixed on mobile (slides in), fixed on desktop (always visible) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-5 border-b border-gray-200">
            <h2 className="text-xl font-bold text-orange-600">Gym & Physio</h2>
            {gymPhysio && (
              <div className="mt-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-sm">
                    {gymPhysio.businessName?.charAt(0).toUpperCase() || 'G'}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{gymPhysio.businessName || 'My Business'}</p>
                  <p className="text-xs text-gray-500 capitalize">{gymPhysio.businessType || 'Gym/Physio'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={() =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActiveRoute(item.path)
                      ? 'bg-orange-50 text-orange-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm">{item.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex w-full items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-xl">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
