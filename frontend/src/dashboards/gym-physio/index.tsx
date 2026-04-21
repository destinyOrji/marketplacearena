// Gym & Physiotherapy Dashboard Entry Point

import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import GymPhysioRoutes from './routes';

/**
 * Gym & Physiotherapy Dashboard Root Component
 * Wraps the dashboard with necessary providers
 */
const GymPhysioDashboard: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <GymPhysioRoutes />
      </NotificationProvider>
    </AuthProvider>
  );
};

export default GymPhysioDashboard;
