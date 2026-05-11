/**
 * Admin Dashboard Layout Component
 * Main layout wrapper with header, sidebar, and content area
 */
import React, { ReactNode, useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiMenu, FiSearch, FiUser, FiLogOut } from 'react-icons/fi';
import Sidebar from './Sidebar';
import { useAdminAuth } from '../contexts/AdminAuthContext';

interface DashboardLayoutProps {
  children: ReactNode;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

const API_URL = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuth();

  const getToken = () =>
    localStorage.getItem('adminToken') || localStorage.getItem('authToken') || '';

  const fetchNotifications = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;
      const res = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const list: Notification[] = data.data || data.notifications || [];
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.read).length);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const token = getToken();
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  const markAllAsRead = async () => {
    try {
      const token = getToken();
      await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      appointment: '📅',
      payment: '💳',
      job: '💼',
      approval: '✅',
      alert: '🔔',
    };
    return icons[type] || '🔔';
  };

  const getPageTitle = () => {
    const path = location.pathname;
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
      '/admin/gym-physio': 'All Gym & Physio',
      '/admin/gym-physio/verification': 'Gym & Physio Verification',
      '/admin/settings': 'Settings',
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
              <h2 className="text-lg font-semibold text-gray-900">{getPageTitle()}</h2>
            </div>

            {/* Header actions */}
            <div className="flex items-center space-x-3">
              {/* Search */}
              <button className="hidden md:flex items-center px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md">
                <FiSearch className="h-5 w-5 mr-2" />
                <span>Search...</span>
              </button>

              {/* Notifications Bell */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Notifications"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-500">
                          <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                          <p className="text-sm">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.slice(0, 10).map((n) => (
                          <button
                            key={n.id}
                            onClick={() => markAsRead(n.id)}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                              !n.read ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-lg flex-shrink-0 mt-0.5">
                                {getNotificationIcon(n.type)}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm ${!n.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                  {n.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                                <p className="text-xs text-gray-400 mt-1">{formatTime(n.createdAt)}</p>
                              </div>
                              {!n.read && (
                                <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />
                              )}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                        <button
                          onClick={() => {
                            navigate('/admin/notifications');
                            setShowNotifications(false);
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium w-full text-center"
                        >
                          View all notifications
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Profile dropdown */}
              <div className="relative" ref={profileRef}>
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

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {admin?.email || 'Admin'}
                        </p>
                        <p className="text-xs text-gray-500">Administrator</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FiLogOut className="mr-3 h-5 w-5 text-gray-400" />
                        Logout
                      </button>
                    </div>
                  </div>
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
