/**
 * Hospital Dashboard Layout Component
 * Main layout wrapper with sidebar, header (notifications + profile), and content area
 */
import React, { ReactNode, useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import {
  FiHome,
  FiUser,
  FiFileText,
  FiCreditCard,
  FiMenu,
  FiX,
  FiLogOut,
} from 'react-icons/fi';
import { useHospital } from '../contexts/HospitalContext';

interface DashboardLayoutProps {
  children?: ReactNode;
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
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { hospital } = useHospital();

  const getToken = () =>
    localStorage.getItem('hospitalToken') || localStorage.getItem('authToken') || '';

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
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
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

  const navigation = [
    { name: 'Dashboard', href: '/hospital/dashboard', icon: FiHome },
    { name: 'Profile', href: '/hospital/profile', icon: FiUser },
    { name: 'Vacancies', href: '/hospital/vacancies', icon: FiFileText },
    { name: 'Applications', href: '/hospital/applications', icon: FiFileText },
    { name: 'Billing', href: '/hospital/billing', icon: FiCreditCard },
  ];

  const isActive = (path: string) => location.pathname === path;

  const hospitalName =
    (hospital as any)?.hospitalName ||
    (hospital as any)?.hospital_name ||
    'Hospital';

  const verificationStatus = (hospital as any)?.isVerified
    ? 'verified'
    : ((hospital as any)?.verification_status || 'pending');

  const handleLogout = () => {
    localStorage.removeItem('hospitalToken');
    localStorage.removeItem('hospital');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/auth/login';
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
              <p className="text-sm font-medium text-gray-900 truncate">{hospitalName}</p>
              <p className="text-xs text-gray-500">
                {(hospital as any).address?.city || (hospital as any).city || ''}
                {((hospital as any).address?.state || (hospital as any).state)
                  ? `, ${(hospital as any).address?.state || (hospital as any).state}`
                  : ''}
              </p>
              <span
                className={`inline-flex mt-2 items-center px-2 py-1 rounded-full text-xs font-medium ${
                  verificationStatus === 'verified'
                    ? 'bg-green-100 text-green-800'
                    : verificationStatus === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {verificationStatus.charAt(0).toUpperCase() + verificationStatus.slice(1)}
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
              onClick={handleLogout}
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
        <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
          >
            <FiMenu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 justify-between px-4 sm:px-6 lg:px-8">
            {/* Page title */}
            <div className="flex flex-1 items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                {navigation.find((item) => isActive(item.href))?.name || 'Hospital Dashboard'}
              </h2>
            </div>

            {/* Right actions */}
            <div className="flex items-center space-x-3">
              {/* Notification Bell */}
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
                  <div className="fixed inset-x-4 top-16 sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto mt-2 w-auto sm:w-80 max-w-md bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </div>
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
                            navigate('/hospital/notifications');
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

              {/* Profile Menu */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Profile menu"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {hospitalName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {hospitalName}
                  </span>
                  <svg className="hidden md:block w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                      <p className="text-sm font-medium text-gray-900 truncate">{hospitalName}</p>
                      <p className="text-xs text-gray-500">Hospital Account</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => { navigate('/hospital/profile'); setShowProfileMenu(false); }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        My Profile
                      </button>
                    </div>
                    <div className="border-t border-gray-200">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
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
            {children ?? <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
