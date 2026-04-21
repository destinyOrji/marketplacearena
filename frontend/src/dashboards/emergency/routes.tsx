// Routes configuration for Emergency Services Dashboard

import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import Loading from './components/Loading';
import { NotificationProvider } from './contexts/NotificationContext';

// Lazy load pages for code splitting
const DashboardHome = React.lazy(() => import('./pages/DashboardHome'));
const ProfileOnboarding = React.lazy(() => import('./pages/ProfileOnboarding'));
const MyServices = React.lazy(() => import('./pages/MyServices'));
const ActiveEmergency = React.lazy(() => import('./pages/ActiveEmergency'));
const BookingHistory = React.lazy(() => import('./pages/BookingHistory'));
const EarningsPayments = React.lazy(() => import('./pages/EarningsPayments'));
const CoverageAreas = React.lazy(() => import('./pages/CoverageAreas'));
const VehiclesEquipment = React.lazy(() => import('./pages/VehiclesEquipment'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const Settings = React.lazy(() => import('./pages/Settings'));

const EmergencyRoutes: React.FC = () => {
  const token = localStorage.getItem('authToken');
  
  return (
    <NotificationProvider token={token}>
      <Suspense fallback={<Loading size="lg" text="Loading..." />}>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/ambulance/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="profile" element={<ProfileOnboarding />} />
            <Route path="services" element={<MyServices />} />
            <Route path="active-emergency" element={<ActiveEmergency />} />
            <Route path="bookings" element={<BookingHistory />} />
            <Route path="earnings" element={<EarningsPayments />} />
            <Route path="coverage" element={<CoverageAreas />} />
            <Route path="vehicles" element={<VehiclesEquipment />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Suspense>
    </NotificationProvider>
  );
};

export default EmergencyRoutes;
