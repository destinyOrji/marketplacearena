// Notification Context for Gym & Physiotherapy Dashboard
// Fetches real notifications from API with polling — same pattern as professional/patient

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';

export interface GymNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

interface NotificationContextType {
  notifications: GymNotification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  // Toast helpers kept for backward compat
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<GymNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const getToken = () =>
    localStorage.getItem('gymPhysioToken') || '';

  const fetchNotifications = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const list: GymNotification[] = (data.data || data.notifications || []).map((n: any) => ({
        id: n._id || n.id,
        title: n.title,
        message: n.message,
        type: n.type || 'general',
        read: n.read ?? n.isRead ?? false,
        createdAt: n.createdAt || new Date().toISOString(),
        actionUrl: n.actionUrl || n.data?.actionUrl,
      }));
      setNotifications(list);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

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
    try {
      const token = getToken();
      await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  };

  const refreshNotifications = async () => { await fetchNotifications(); };

  // Toast helpers — kept so existing code that calls showSuccess/showError still works
  const showSuccess = (message: string) => console.log('[success]', message);
  const showError   = (message: string) => console.error('[error]', message);
  const showInfo    = (message: string) => console.info('[info]', message);
  const showWarning = (message: string) => console.warn('[warning]', message);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      markAsRead,
      markAllAsRead,
      refreshNotifications,
      showSuccess,
      showError,
      showInfo,
      showWarning,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};

// Also export as useNotifications for consistency with other dashboards
export const useNotifications = useNotification;
