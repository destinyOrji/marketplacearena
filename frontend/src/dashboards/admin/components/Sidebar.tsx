/**
 * Admin Sidebar Component
 * Collapsible grouped navigation filtered by role and permissions.
 */
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiHome, FiUsers, FiUserCheck, FiActivity, FiTruck,
  FiSettings, FiChevronDown, FiChevronRight, FiX,
  FiAlertCircle, FiBookOpen, FiLogOut, FiShield,
} from 'react-icons/fi';
import { useAdminAuth } from '../contexts/AdminAuthContext';

export interface SidebarMenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  permission?: string;        // if set, item is hidden unless hasPermission(permission)
  children?: SidebarMenuItem[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Map each section / child to the permission key that gates it.
// A group is visible if at least one child passes, or if it has no permission set.
const sidebarMenu: SidebarMenuItem[] = [
  { id: 'overview',          label: 'Overview',          icon: FiHome,       path: '/admin/overview',          permission: 'dashboard_view' },
  { id: 'pending-approvals', label: 'Pending Approvals', icon: FiAlertCircle,path: '/admin/pending-approvals', permission: 'dashboard_view' },

  {
    id: 'patients', label: 'Patients', icon: FiUsers,
    children: [
      { id: 'all-patients',            label: 'All Patients',       icon: FiUsers,    path: '/admin/patients',                   permission: 'users_view' },
      { id: 'patient-appointments',    label: 'Appointments',       icon: FiActivity, path: '/admin/patients/all-appointments',  permission: 'users_view' },
      { id: 'patient-medical-records', label: 'Medical Records',    icon: FiActivity, path: '/admin/patients/all-records',       permission: 'users_view' },
      { id: 'patient-emergency',       label: 'Emergency Bookings', icon: FiActivity, path: '/admin/patients/all-emergencies',   permission: 'users_view' },
      { id: 'patient-payments',        label: 'Payments',           icon: FiActivity, path: '/admin/patients/all-payments',      permission: 'users_view' },
    ],
  },

  {
    id: 'professionals', label: 'Professionals', icon: FiUserCheck,
    children: [
      { id: 'all-professionals',  label: 'All Professionals', icon: FiUserCheck, path: '/admin/professionals',                permission: 'professionals_view' },
      { id: 'prof-verification',  label: 'Verification',       icon: FiShield,    path: '/admin/professionals/verification',  permission: 'professionals_verify' },
      { id: 'all-services',       label: 'All Services',       icon: FiActivity,  path: '/admin/services',                   permission: 'professionals_view' },
      { id: 'prof-applications',  label: 'Job Applications',   icon: FiActivity,  path: '/admin/professionals/all-applications', permission: 'professionals_view' },
      { id: 'prof-schedules',     label: 'Schedules',          icon: FiActivity,  path: '/admin/professionals/all-schedules',    permission: 'professionals_view' },
      { id: 'prof-earnings',      label: 'Earnings',           icon: FiActivity,  path: '/admin/professionals/all-earnings',     permission: 'professionals_view' },
    ],
  },

  {
    id: 'hospitals', label: 'Hospitals', icon: FiActivity,
    children: [
      { id: 'all-hospitals',          label: 'All Hospitals',  icon: FiActivity, path: '/admin/hospitals',                   permission: 'hospitals_view' },
      { id: 'hospital-verification',  label: 'Verification',   icon: FiShield,   path: '/admin/hospitals/verification',      permission: 'hospitals_verify' },
      { id: 'hospital-vacancies',     label: 'Job Vacancies',  icon: FiActivity, path: '/admin/hospitals/vacancies',         permission: 'hospitals_view' },
      { id: 'hospital-applications',  label: 'Applications',   icon: FiActivity, path: '/admin/hospitals/all-applications',  permission: 'hospitals_view' },
      { id: 'hospital-subscriptions', label: 'Subscriptions',  icon: FiActivity, path: '/admin/hospitals/all-subscriptions', permission: 'hospitals_view' },
      { id: 'hospital-earnings',      label: 'Earnings',       icon: FiActivity, path: '/admin/hospitals/all-earnings',      permission: 'hospitals_view' },
    ],
  },

  {
    id: 'ambulances', label: 'Ambulances', icon: FiTruck,
    children: [
      { id: 'all-ambulances',         label: 'All Providers',      icon: FiTruck, path: '/admin/ambulances',              permission: 'ambulances_view' },
      { id: 'ambulance-verification', label: 'Verification',       icon: FiShield, path: '/admin/ambulances/verification', permission: 'ambulances_verify' },
      { id: 'ambulance-bookings',     label: 'Emergency Bookings', icon: FiTruck, path: '/admin/ambulances/bookings',      permission: 'ambulances_view' },
      { id: 'ambulance-availability', label: 'Availability',       icon: FiTruck, path: '/admin/ambulances/availability',  permission: 'ambulances_view' },
      { id: 'ambulance-fleet',        label: 'Fleet Management',   icon: FiTruck, path: '/admin/ambulances/all-fleet',     permission: 'ambulances_view' },
      { id: 'ambulance-earnings',     label: 'Earnings',           icon: FiTruck, path: '/admin/ambulances/all-earnings',  permission: 'ambulances_view' },
    ],
  },

  {
    id: 'gym-physio', label: 'Gym & Physio', icon: FiActivity,
    children: [
      { id: 'all-gym-physio',          label: 'All Providers', icon: FiActivity, path: '/admin/gym-physio',                 permission: 'gym_view' },
      { id: 'gym-physio-verification', label: 'Verification',  icon: FiShield,   path: '/admin/gym-physio/verification',    permission: 'gym_verify' },
      { id: 'gym-services',            label: 'Services',      icon: FiActivity, path: '/admin/gym-physio/all-services',    permission: 'gym_view' },
      { id: 'gym-appointments',        label: 'Appointments',  icon: FiActivity, path: '/admin/gym-physio/all-appointments',permission: 'gym_view' },
      { id: 'gym-earnings',            label: 'Earnings',      icon: FiActivity, path: '/admin/gym-physio/all-earnings',    permission: 'gym_view' },
    ],
  },

  {
    id: 'blog', label: 'Blog', icon: FiBookOpen,
    children: [
      { id: 'blog-posts',  label: 'All Posts',   icon: FiBookOpen, path: '/admin/blog',        permission: 'blog_view' },
      { id: 'blog-create', label: 'Create Post', icon: FiBookOpen, path: '/admin/blog/create', permission: 'blog_edit' },
    ],
  },

  {
    id: 'settings', label: 'Settings', icon: FiSettings,
    children: [
      { id: 'settings-main',    label: 'System Settings',     icon: FiSettings, path: '/admin/settings',           permission: 'settings_edit' },
      { id: 'settings-users',   label: 'Admin Users',         icon: FiUsers,    path: '/admin/settings/users',     permission: 'settings_edit' },
      { id: 'settings-roles',   label: 'Roles & Permissions', icon: FiShield,   path: '/admin/settings/roles' },   // all roles can view
      { id: 'settings-payment', label: 'Payment Settings',    icon: FiSettings, path: '/admin/settings/payments',  permission: 'settings_edit' },
      { id: 'settings-audit',   label: 'Audit Logs',          icon: FiSettings, path: '/admin/settings/audit-logs',permission: 'settings_edit' },
    ],
  },
];

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  moderator: 'Moderator',
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { admin, hasPermission, logout } = useAdminAuth();

  // Auto-expand the section containing the active path
  const getInitialExpanded = () => {
    const set = new Set<string>();
    sidebarMenu.forEach(item => {
      if (item.children?.some(c => c.path && location.pathname.startsWith(c.path))) {
        set.add(item.id);
      }
    });
    return set;
  };

  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(getInitialExpanded);

  const toggleMenu = (id: string) => {
    setExpandedMenus(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Permission helpers ────────────────────────────────────────────────────
  const canSee = (item: SidebarMenuItem): boolean => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  };

  const visibleChildren = (item: SidebarMenuItem): SidebarMenuItem[] =>
    (item.children ?? []).filter(canSee);

  // ── Active state ──────────────────────────────────────────────────────────
  const isActive = (path?: string) =>
    !!path && (location.pathname === path || location.pathname.startsWith(path + '/'));

  const isGroupActive = (item: SidebarMenuItem): boolean =>
    isActive(item.path) || (item.children ?? []).some(c => isActive(c.path));

  // ── Render ────────────────────────────────────────────────────────────────
  const renderItem = (item: SidebarMenuItem, indent = false) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    return (
      <Link
        key={item.id}
        to={item.path!}
        onClick={onClose}
        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
          indent ? 'pl-9' : ''
        } ${
          active
            ? 'bg-blue-50 text-blue-600'
            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        <Icon className={`mr-3 h-4 w-4 flex-shrink-0 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
        {item.label}
      </Link>
    );
  };

  const renderGroup = (item: SidebarMenuItem) => {
    const children = visibleChildren(item);
    if (children.length === 0) return null;

    const Icon = item.icon;
    const expanded = expandedMenus.has(item.id);
    const groupActive = isGroupActive(item);

    return (
      <div key={item.id}>
        <button
          onClick={() => toggleMenu(item.id)}
          className={`flex w-full items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            groupActive
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center">
            <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${groupActive ? 'text-blue-600' : 'text-gray-400'}`} />
            {item.label}
          </div>
          {expanded
            ? <FiChevronDown className="h-4 w-4 flex-shrink-0" />
            : <FiChevronRight className="h-4 w-4 flex-shrink-0" />}
        </button>
        {expanded && (
          <div className="mt-1 space-y-0.5">
            {children.map(child => renderItem(child, true))}
          </div>
        )}
      </div>
    );
  };

  const renderTopLevel = (item: SidebarMenuItem) => {
    if (item.children) return renderGroup(item);
    if (!canSee(item)) return null;
    return renderItem(item);
  };

  const initials = admin
    ? `${admin.firstName?.[0] ?? ''}${admin.lastName?.[0] ?? ''}`.toUpperCase() || 'A'
    : 'A';

  const displayName = admin
    ? `${admin.firstName ?? ''} ${admin.lastName ?? ''}`.trim() || admin.email
    : 'Admin';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg flex flex-col
          transform transition-transform duration-300 ease-in-out lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b flex-shrink-0">
          <h1 className="text-xl font-bold text-blue-600">Admin Portal</h1>
          <button onClick={onClose} className="lg:hidden p-1 rounded-md text-gray-500 hover:bg-gray-100">
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Profile card */}
        {admin && (
          <div className="px-4 py-3 border-b flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-semibold">{initials}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                <span className={`inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded-full ${
                  admin.role === 'super_admin' ? 'bg-blue-100 text-blue-800' :
                  admin.role === 'admin'       ? 'bg-gray-100 text-gray-700' :
                                                 'bg-amber-100 text-amber-800'
                }`}>
                  {ROLE_LABELS[admin.role] ?? admin.role}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {sidebarMenu.map(renderTopLevel)}
        </nav>

        {/* Logout */}
        <div className="border-t px-3 py-4 flex-shrink-0">
          <button
            onClick={() => logout()}
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
