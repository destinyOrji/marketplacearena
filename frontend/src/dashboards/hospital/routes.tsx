/**
 * Hospital Dashboard Routes
 */
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HospitalProvider } from './contexts/HospitalContext';
import AuthWrapper from './components/AuthWrapper';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';
import Vacancies from './pages/Vacancies';
import VacancyForm from './pages/VacancyForm';
import VacancyDetail from './pages/VacancyDetail';
import Applications from './pages/Applications';
import ApplicationDetail from './pages/ApplicationDetail';
import Billing from './pages/Billing';
import Subscription from './pages/Subscription';

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const HospitalRoutes: React.FC = () => {
  return (
    <AuthWrapper>
      <HospitalProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Navigate to="/hospital/dashboard" replace />} />
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/vacancies" element={<Vacancies />} />
              <Route path="/vacancies/new" element={<VacancyForm />} />
              <Route path="/vacancies/:id" element={<VacancyDetail />} />
              <Route path="/vacancies/:id/edit" element={<VacancyForm />} />
              <Route path="/applications" element={<Applications />} />
              <Route path="/applications/:id" element={<ApplicationDetail />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/subscription" element={<Subscription />} />
            </Route>
            <Route path="*" element={<Navigate to="/hospital/dashboard" replace />} />
          </Routes>
        </Suspense>
      </HospitalProvider>
    </AuthWrapper>
  );
};

export default HospitalRoutes;

export interface RouteConfig {
  path: string;
  element: React.ReactElement;
  title: string;
}

export const hospitalRoutes: RouteConfig[] = [
  {
    path: 'dashboard',
    element: <Dashboard />,
    title: 'Dashboard',
  },
  {
    path: 'profile',
    element: <Profile />,
    title: 'Hospital Profile',
  },
  {
    path: 'onboarding',
    element: <Onboarding />,
    title: 'Complete Onboarding',
  },
  {
    path: 'vacancies',
    element: <Vacancies />,
    title: 'Job Vacancies',
  },
  {
    path: 'vacancies/new',
    element: <VacancyForm />,
    title: 'Create Vacancy',
  },
  {
    path: 'vacancies/:id',
    element: <VacancyDetail />,
    title: 'Vacancy Details',
  },
  {
    path: 'vacancies/:id/edit',
    element: <VacancyForm />,
    title: 'Edit Vacancy',
  },
  {
    path: 'applications',
    element: <Applications />,
    title: 'Applications',
  },
  {
    path: 'applications/:id',
    element: <ApplicationDetail />,
    title: 'Application Details',
  },
  {
    path: 'billing',
    element: <Billing />,
    title: 'Billing & Payments',
  },
  {
    path: 'subscription',
    element: <Subscription />,
    title: 'Subscription',
  },
];

