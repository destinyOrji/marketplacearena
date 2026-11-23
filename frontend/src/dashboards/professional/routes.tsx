/**
 * Professional Dashboard Routes
 * Routes that require an active subscription are wrapped in SubscriptionGuard.
 * Exempt (always accessible): dashboard, profile, settings, notifications, subscription.
 */
import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import SubscriptionGuard from './components/SubscriptionGuard';

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────
const DashboardHome        = lazy(() => import('./pages/DashboardHome'));
const ProfileOnboarding    = lazy(() => import('./pages/ProfileOnboarding'));
const MyServices           = lazy(() => import('./pages/MyServices'));
const BrowseJobs           = lazy(() => import('./pages/BrowseJobs'));
const MyApplications       = lazy(() => import('./pages/MyApplications'));
const ApprovedJobs         = lazy(() => import('./pages/ApprovedJobs'));
const Appointments         = lazy(() => import('./pages/Appointments'));
const ScheduleAvailability = lazy(() => import('./pages/ScheduleAvailability'));
const PaymentsEarnings     = lazy(() => import('./pages/PaymentsEarnings'));
const Analytics            = lazy(() => import('./pages/Analytics'));
const Settings             = lazy(() => import('./pages/Settings'));
const Notifications        = lazy(() => import('./pages/Notifications'));
const PatientRecords       = lazy(() => import('./pages/PatientRecords'));
const VideoCall            = lazy(() => import('./pages/VideoCall'));
const Subscription         = lazy(() => import('./pages/Subscription'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
  </div>
);

// ─── Convenience wrapper ──────────────────────────────────────────────────────
const Gated: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SubscriptionGuard>{children}</SubscriptionGuard>
);

const ProfessionalRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Navigate to="/professional/dashboard" replace />} />

        <Route element={<DashboardLayout />}>
          {/* ── Always accessible ── */}
          <Route path="/dashboard"     element={<DashboardHome />} />
          <Route path="/profile"       element={<ProfileOnboarding />} />
          <Route path="/settings"      element={<Settings />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/subscription"  element={<Subscription />} />

          {/* ── Requires active subscription ── */}
          <Route path="/services"      element={<Gated><MyServices /></Gated>} />
          <Route path="/jobs"          element={<Gated><BrowseJobs /></Gated>} />
          <Route path="/applications"  element={<Gated><MyApplications /></Gated>} />
          <Route path="/approved-jobs" element={<Gated><ApprovedJobs /></Gated>} />
          <Route path="/appointments"  element={<Gated><Appointments /></Gated>} />
          <Route path="/schedule"      element={<Gated><ScheduleAvailability /></Gated>} />
          <Route path="/payments"      element={<Gated><PaymentsEarnings /></Gated>} />
          <Route path="/analytics"     element={<Gated><Analytics /></Gated>} />
          <Route path="/patient-records" element={<Gated><PatientRecords /></Gated>} />
        </Route>

        {/* Video call is full-screen — outside DashboardLayout */}
        <Route path="/video-call/:appointmentId" element={<Gated><VideoCall /></Gated>} />

        <Route path="*" element={<Navigate to="/professional/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};

export default ProfessionalRoutes;
