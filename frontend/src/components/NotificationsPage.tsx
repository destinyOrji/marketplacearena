/**
 * Shared Notifications Page
 * Used by all dashboards — pass the token key and dashboard base path
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  _id?: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

interface NotificationsPageProps {
  /** localStorage key for the auth token */
  tokenKey?: string;
  /** Base path for back navigation e.g. '/professional/dashboard' */
  backPath?: string;
  /** Dashboard display name */
  dashboardName?: string;
}

const API_URL = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';

const typeIcon: Record<string, string> = {
  appointment: '📅',
  payment: '💳',
  job: '💼',
  job_posted: '📢',
  application_received: '📋',
  approval: '✅',
  approved: '✅',
  rejected: '❌',
  alert: '🔔',
  emergency: '🚨',
  subscription: '⭐',
};

const typeColor: Record<string, string> = {
  appointment: 'bg-blue-50 border-blue-200',
  payment: 'bg-green-50 border-green-200',
  job: 'bg-purple-50 border-purple-200',
  job_posted: 'bg-indigo-50 border-indigo-200',
  application_received: 'bg-yellow-50 border-yellow-200',
  approval: 'bg-green-50 border-green-200',
  approved: 'bg-green-50 border-green-200',
  rejected: 'bg-red-50 border-red-200',
  alert: 'bg-orange-50 border-orange-200',
  emergency: 'bg-red-50 border-red-200',
  subscription: 'bg-blue-50 border-blue-200',
};

const NotificationsPage: React.FC<NotificationsPageProps> = ({
  tokenKey = 'authToken',
  backPath = '/',
  dashboardName = 'Dashboard',
}) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [markingAll, setMarkingAll] = useState(false);

  const getToken = () =>
    localStorage.getItem(tokenKey) || localStorage.getItem('authToken') || '';

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) return;
      const res = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const list: Notification[] = (data.data || data.notifications || []).map((n: any) => ({
        ...n,
        id: n._id || n.id,
      }));
      setNotifications(list);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [tokenKey]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      const token = getToken();
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {}
  };

  const markAllAsRead = async () => {
    setMarkingAll(true);
    try {
      const token = getToken();
      await fetch(`${API_URL}/notifications/mark-all-read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
    setMarkingAll(false);
  };

  const handleClick = async (n: Notification) => {
    if (!n.read) await markAsRead(n.id);
    if (n.actionUrl) navigate(n.actionUrl);
  };

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(backPath)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-500">{dashboardName}</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            disabled={markingAll}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 flex items-center gap-1"
          >
            {markingAll ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-1 flex gap-1">
        {(['all', 'unread', 'read'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors capitalize ${
              filter === f
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {f}
            {f === 'unread' && unreadCount > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                filter === 'unread' ? 'bg-white text-blue-600' : 'bg-red-100 text-red-600'
              }`}>
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            {filter === 'unread' ? 'All caught up!' : 'No notifications'}
          </h3>
          <p className="text-sm text-gray-500">
            {filter === 'unread'
              ? 'You have no unread notifications.'
              : filter === 'read'
              ? 'No read notifications yet.'
              : 'Notifications will appear here when there is activity.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(n => (
            <div
              key={n.id}
              onClick={() => handleClick(n)}
              className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-sm ${
                !n.read
                  ? (typeColor[n.type] || 'bg-blue-50 border-blue-200')
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg ${
                  !n.read ? 'bg-white shadow-sm' : 'bg-gray-100'
                }`}>
                  {typeIcon[n.type] || '🔔'}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm leading-snug ${!n.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {n.title}
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-400 whitespace-nowrap">{formatTime(n.createdAt)}</span>
                      {!n.read && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">{n.message}</p>
                  {n.actionUrl && (
                    <p className="text-xs text-blue-600 mt-1.5 font-medium">Tap to view →</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Refresh */}
      <div className="text-center pb-4">
        <button
          onClick={fetchNotifications}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          ↻ Refresh
        </button>
      </div>
    </div>
  );
};

export default NotificationsPage;
