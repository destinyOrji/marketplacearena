// Routing configuration for Gym & Physiotherapy Dashboard

import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';

// Lazy load pages for code splitting
const DashboardHome = lazy(() => import('./pages/DashboardHome'));
const ProfileOnboarding = lazy(() => import('./pages/ProfileOnboarding'));
const MyServices = lazy(() => import('./pages/MyServices'));
const Appointments = lazy(() => import('./pages/Appointments'));
const RecordAppointment = lazy(() => import('./pages/RecordAppointment'));
const ScheduleAvailability = lazy(() => import('./pages/ScheduleAvailability'));
const PaymentsEarnings = lazy(() => import('./pages/PaymentsEarnings'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Settings = lazy(() => import('./pages/Settings'));
const Subscription = lazy(() => import('./pages/Subscription'));
const Notifications = lazy(() => import('./pages/Notifications'));
const VideoCall = lazy(() => import('./pages/VideoCall'));

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

/**
 * Gym & Physiotherapy Dashboard Routes
 */
const GymPhysioRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Navigate to="/gym-physio/dashboard" replace />} />
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/profile" element={<ProfileOnboarding />} />
          <Route path="/services" element={<MyServices />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/record-appointment" element={<RecordAppointment />} />
          <Route path="/schedule" element={<ScheduleAvailability />} />
          <Route path="/payments" element={<PaymentsEarnings />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>
        {/* Video call is full-screen — outside DashboardLayout */}
        <Route path="/video-call/:appointmentId" element={<VideoCall />} />
        <Route path="*" element={<Navigate to="/gym-physio/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};

export default GymPhysioRoutes;
