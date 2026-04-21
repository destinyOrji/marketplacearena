// Notification Context - Manage notifications and WebSocket connection

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Notification } from '../types';
import { notificationsApi } from '../services/api';
import websocketService from '../services/websocket';
import { toast } from 'react-toastify';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
  token: string | null;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children, token }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Fetch initial notifications
  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token]);

  // Setup WebSocket connection
  useEffect(() => {
    if (!token) return;

    // Disable WebSocket for now - Socket.io not configured on backend
    // websocketService.connect(token);
    // setIsConnected(websocketService.isConnected());

    // Handle new notifications
    // const handleNewNotification = (notification: Notification) => {
    //   setNotifications((prev) => [notification, ...prev]);
    //   
    //   // Show toast for important notifications
    //   if (notification.type === 'emergency' || notification.type === 'booking') {
    //     toast.info(notification.message, {
    //       autoClose: 5000,
    //     });
    //   }
    // };

    // websocketService.onNewNotification(handleNewNotification);

    // Cleanup
    return () => {
      // websocketService.offNewNotification(handleNewNotification);
    };
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const data = await notificationsApi.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isConnected,
        markAsRead,
        markAllAsRead,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
