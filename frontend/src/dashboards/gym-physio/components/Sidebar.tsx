import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { gymPhysio } = useAuth();

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

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-orange-600">Gym & Physio</h2>
            {gymPhysio && (
              <p className="text-sm text-gray-600 mt-1">{gymPhysio.businessName}</p>
            )}
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-orange-50 text-orange-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
                onClick={onClose}
              >
                <span className="mr-3 text-xl">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
