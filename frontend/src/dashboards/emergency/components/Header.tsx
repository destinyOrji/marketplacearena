// Header Component with Availability Toggle

import React, { useState, useRef, useEffect } from 'react';
import { EmergencyProvider } from '../types';
import AvailabilityToggle from './AvailabilityToggle';
import { useNotifications } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface HeaderProps {
  provider: EmergencyProvider | null;
  isAvailable: boolean;
  onToggleAvailability: (available: boolean) => void;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({
  provider,
  isAvailable,
  onToggleAvailability,
  onToggleSidebar,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) await markAsRead(notification.id);
    if (notification.actionUrl) navigate(notification.actionUrl);
    setShowNotifications(false);
  };

  const typeIcon: Record<string, string> = {
    appointment: '📅', payment: '💳', emergency: '🚨',
    approval: '✅', alert: '🔔', general: '🔔',
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Menu Button */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          aria-label="Toggle sidebar menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Center: Availability Toggle */}
        <div className="flex-1 flex justify-center">
          <AvailabilityToggle isAvailable={isAvailable} onChange={onToggleAvailability} />
        </div>

        {/* Right: Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg hover:bg-gray-100 relative"
            aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
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
                    onClick={() => markAllAsRead()}
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
                  notifications.slice(0, 10).map((n: any) => (
                    <button
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 transition-colors ${!n.read ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg flex-shrink-0 mt-0.5">{typeIcon[n.type] || '🔔'}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!n.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDistanceToNow(new Date(n.createdAt || n.timestamp || Date.now()), { addSuffix: true })}
                          </p>
                        </div>
                        {!n.read && <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />}
                      </div>
                    </button>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={() => { navigate('/ambulance/notifications'); setShowNotifications(false); }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium w-full text-center"
                  >
                    View all notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
