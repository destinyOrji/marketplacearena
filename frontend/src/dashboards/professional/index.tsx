// Professional Dashboard Entry Point

import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProfessionalRoutes from './routes';

/**
 * Professional Dashboard Root Component
 * Wraps the dashboard with necessary providers
 */
const ProfessionalDashboard: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ProfessionalRoutes />
      </NotificationProvider>
    </AuthProvider>
  );
};

export default ProfessionalDashboard;
