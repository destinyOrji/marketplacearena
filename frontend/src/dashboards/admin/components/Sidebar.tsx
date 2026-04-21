/**
 * Admin Sidebar Component
 * Sidebar navigation with collapsible dropdown menus
 */
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiUsers,
  FiUserCheck,
  FiActivity,
  FiTruck,
  FiSettings,
  FiChevronDown,
  FiChevronRight,
  FiX
} from 'react-icons/fi';

export interface SidebarMenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  children?: SidebarMenuItem[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const sidebarMenu: SidebarMenuItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: FiHome,
    path: '/admin/overview'
  },
  {
    id: 'patients',
    label: 'Patients',
    icon: FiUsers,
    children: [
      { id: 'all-patients', label: 'All Patients', icon: FiUsers, path: '/admin/patients' },
      { id: 'patient-profiles', label: 'Patient Profiles', icon: FiUsers, path: '/admin/patients/profiles' },
      { id: 'appointments', label: 'Appointments', icon: FiActivity, path: '/admin/patients/appointments' },
      { id: 'medical-records', label: 'Medical Records', icon: FiActivity, path: '/admin/patients/records' },
      { id: 'emergency-bookings', label: 'Emergency Bookings', icon: FiTruck, path: '/admin/patients/emergencies' }
    ]
  },
  {
    id: 'professionals',
    label: 'Professionals',
    icon: FiUserCheck,
    children: [
      { id: 'all-professionals', label: 'All Professionals', icon: FiUserCheck, path: '/admin/professionals' },
      { id: 'professional-profiles', label: 'Profiles', icon: FiUserCheck, path: '/admin/professionals/profiles' },
      { id: 'services', label: 'Services', icon: FiActivity, path: '/admin/services' },
      { id: 'applications', label: 'Job Applications', icon: FiActivity, path: '/admin/professionals/applications' },
      { id: 'schedules', label: 'Schedules', icon: FiActivity, path: '/admin/professionals/schedules' },
      { id: 'earnings', label: 'Earnings', icon: FiActivity, path: '/admin/professionals/earnings' },
      { id: 'verification', label: 'Verification', icon: FiActivity, path: '/admin/professionals/verification' }
    ]
  },
  {
    id: 'hospitals',
    label: 'Hospitals',
    icon: FiActivity,
    children: [
      { id: 'all-hospitals', label: 'All Hospitals', icon: FiActivity, path: '/admin/hospitals' },
      { id: 'hospital-profiles', label: 'Profiles', icon: FiActivity, path: '/admin/hospitals/profiles' },
      { id: 'vacancies', label: 'Job Vacancies', icon: FiActivity, path: '/admin/hospitals/vacancies' },
      { id: 'hospital-applications', label: 'Applications', icon: FiActivity, path: '/admin/hospitals/applications' },
      { id: 'subscriptions', label: 'Subscriptions', icon: FiActivity, path: '/admin/hospitals/subscriptions' },
      { id: 'hospital-verification', label: 'Verification', icon: FiActivity, path: '/admin/hospitals/verification' }
    ]
  },
  {
    id: 'ambulances',
    label: 'Ambulances',
    icon: FiTruck,
    children: [
      { id: 'all-providers', label: 'All Providers', icon: FiTruck, path: '/admin/ambulances' },
      { id: 'provider-profiles', label: 'Profiles', icon: FiTruck, path: '/admin/ambulances/profiles' },
      { id: 'ambulance-bookings', label: 'Emergency Bookings', icon: FiTruck, path: '/admin/ambulances/bookings' },
      { id: 'fleet', label: 'Fleet Management', icon: FiTruck, path: '/admin/ambulances/fleet' },
      { id: 'availability', label: 'Availability', icon: FiTruck, path: '/admin/ambulances/availability' },
      { id: 'ambulance-verification', label: 'Verification', icon: FiTruck, path: '/admin/ambulances/verification' }
    ]
  },
  {
    id: 'gym-physio',
    label: 'Gym & Physio',
    icon: FiActivity,
    children: [
      { id: 'all-gym-physio', label: 'All Providers', icon: FiActivity, path: '/admin/gym-physio' },
      { id: 'gym-physio-verification', label: 'Verification', icon: FiActivity, path: '/admin/gym-physio/verification' }
    ]
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: FiSettings,
    path: '/admin/settings'
  }
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(menuId)) {
        newSet.delete(menuId);
      } else {
        newSet.add(menuId);
      }
      return newSet;
    });
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isMenuActive = (item: SidebarMenuItem): boolean => {
    if (item.path && isActive(item.path)) return true;
    if (item.children) {
      return item.children.some(child => isActive(child.path));
    }
    return false;
  };

  const renderMenuItem = (item: SidebarMenuItem, isChild: boolean = false) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.has(item.id);
    const active = isMenuActive(item);

    if (hasChildren) {
      return (
        <div key={item.id}>
          <button
            onClick={() => toggleMenu(item.id)}
            className={`flex w-full items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              active
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center">
              <Icon className={`mr-3 h-5 w-5 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
              {item.label}
            </div>
            {isExpanded ? (
              <FiChevronDown className="h-4 w-4" />
            ) : (
              <FiChevronRight className="h-4 w-4" />
            )}
          </button>
          {isExpanded && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children!.map(child => renderMenuItem(child, true))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.id}
        to={item.path!}
        onClick={onClose}
        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
          isChild ? 'pl-6' : ''
        } ${
          isActive(item.path)
            ? 'bg-blue-50 text-blue-600'
            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        <Icon className={`mr-3 h-5 w-5 ${isActive(item.path) ? 'text-blue-600' : 'text-gray-400'}`} />
        {item.label}
      </Link>
    );
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b">
          <h1 className="text-xl font-bold text-blue-600">Admin Portal</h1>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {sidebarMenu.map(item => renderMenuItem(item))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
