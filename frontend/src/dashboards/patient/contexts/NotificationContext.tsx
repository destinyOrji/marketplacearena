import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { Notification, NotificationPreferences } from '../types';
import { notificationsApi } from '../services/api';
import { useAuth } from './AuthContext';
import { showAppointmentReminder, showPaymentSuccess, showSystemNotification } from '../utils/toast';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  preferences: NotificationPreferences;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  updatePreferences: (prefs: NotificationPreferences) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export { NotificationContext };

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: true,
    sms: true,
    inApp: true,
    appointmentReminders: true,
    promotions: false,
  });
  const previousNotificationIds = useRef<Set<string>>(new Set());

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);
      const response = await notificationsApi.getNotifications();
      
      // Handle both paginated and non-paginated responses
      const notificationData = (response as any).data?.data ?? (response as any).data ?? [];
      const notificationList = Array.isArray(notificationData) 
        ? notificationData 
        : notificationData.data || [];
      
      // Convert timestamp strings to Date objects
      const parsedNotifications = notificationList.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp),
      }));
      
      // Check for new notifications and show toasts
      if (preferences.inApp && previousNotificationIds.current.size > 0) {
        parsedNotifications.forEach((notification: Notification) => {
          if (!previousNotificationIds.current.has(notification.id) && !notification.read) {
            // Show toast based on notification type
            switch (notification.type) {
              case 'appointment':
                if (preferences.appointmentReminders) {
                  showAppointmentReminder(notification.message);
                }
                break;
              case 'payment':
                showPaymentSuccess(notification.message);
                break;
              case 'system':
                showSystemNotification(notification.message);
                break;
              default:
                showSystemNotification(notification.message);
            }
          }
        });
      }
      
      // Update the set of notification IDs
      previousNotificationIds.current = new Set(parsedNotifications.map((n: Notification) => n.id));
      
      setNotifications(parsedNotifications);
    } catch (err: any) {
      console.error('Failed to fetch notifications:', err);
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, preferences.inApp, preferences.appointmentReminders]);

  // Mark a single notification as read
  const markAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err: any) {
      console.error('Failed to mark notification as read:', err);
      throw err;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
    } catch (err: any) {
      console.error('Failed to mark all notifications as read:', err);
      throw err;
    }
  };

  // Update notification preferences
  const updatePreferences = (prefs: NotificationPreferences) => {
    setPreferences(prefs);
    // Store in localStorage for persistence
    localStorage.setItem('notificationPreferences', JSON.stringify(prefs));
  };

  // Load preferences from localStorage on mount
  useEffect(() => {
    const storedPrefs = localStorage.getItem('notificationPreferences');
    if (storedPrefs) {
      try {
        const parsedPrefs = JSON.parse(storedPrefs);
        setPreferences(parsedPrefs);
      } catch (err) {
        console.error('Failed to parse notification preferences:', err);
      }
    }
  }, []);

  // Fetch notifications on mount and when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, fetchNotifications]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        preferences,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        updatePreferences,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
