import { useContext } from 'react';
import { NotificationContext } from '../contexts/NotificationContext';

/**
 * Custom hook to access notification context
 * Must be used within NotificationProvider
 * 
 * @returns NotificationContext value with notifications state and actions
 * @throws Error if used outside NotificationProvider
 */
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default useNotifications;
