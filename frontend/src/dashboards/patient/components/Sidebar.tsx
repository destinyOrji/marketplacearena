import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  SearchIcon,
  CalendarIcon,
  ExclamationIcon,
  DocumentIcon,
  CreditCardIcon,
  ChatIcon,
  UserCircleIcon,
  XIcon,
} from './Icons';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <HomeIcon className="w-6 h-6" />,
      path: '/patient/dashboard',
    },
    {
      id: 'browse-services',
      label: 'Browse Services',
      icon: <SearchIcon className="w-6 h-6" />,
      path: '/patient/browse-services',
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: <CalendarIcon className="w-6 h-6" />,
      path: '/patient/appointments',
    },
    {
      id: 'emergency',
      label: 'Emergency',
      icon: <ExclamationIcon className="w-6 h-6" />,
      path: '/patient/emergency',
    },
    {
      id: 'records',
      label: 'Records',
      icon: <DocumentIcon className="w-6 h-6" />,
      path: '/patient/medical-records',
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: <CreditCardIcon className="w-6 h-6" />,
      path: '/patient/payments',
    },
    {
      id: 'feedback',
      label: 'Feedback',
      icon: <ChatIcon className="w-6 h-6" />,
      path: '/patient/feedback',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <UserCircleIcon className="w-6 h-6" />,
      path: '/patient/profile',
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-xl
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        aria-label="Main navigation"
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Patient Portal
          </h2>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close sidebar"
          >
            <XIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2" aria-label="Dashboard sections">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => {
                  // Close sidebar on mobile after navigation
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
                aria-current={active ? 'page' : undefined}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${
                    active
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <span className={active ? 'text-white' : 'text-gray-600'} aria-hidden="true">
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span 
                    className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full"
                    aria-label={`${item.badge} notifications`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
