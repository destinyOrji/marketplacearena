/**
 * Hospital Dashboard
 * Main entry point for the hospital dashboard module
 */
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HospitalProvider } from './contexts/HospitalContext';
import { hospitalRoutes } from './routes';
import DashboardLayout from './components/DashboardLayout';

const HospitalDashboard: React.FC = () => {
  return (
    <HospitalProvider>
      <DashboardLayout>
        <Routes>
          {hospitalRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={route.element}
            />
          ))}
          <Route path="*" element={<Navigate to="/hospital/dashboard" replace />} />
        </Routes>
      </DashboardLayout>
    </HospitalProvider>
  );
};

export default HospitalDashboard;
