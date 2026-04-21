/**
 * Admin Dashboard Routes
 * Defines all routes for the admin dashboard
 */
import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { ProtectedRoute, DashboardLayout } from './components';
import AdminLogin from './pages/Login';

// Lazy load pages for code splitting
const OverviewPage = lazy(() => import('./pages/Overview'));

// Patient pages
const AllPatientsPage = lazy(() => import('./pages/patients/AllPatients'));
const PatientDetailPage = lazy(() => import('./pages/patients/PatientDetail'));
const PatientEditPage = lazy(() => import('./pages/patients/PatientEdit'));
const PatientAppointmentsPage = lazy(() => import('./pages/patients/PatientAppointments'));
const PatientMedicalRecordsPage = lazy(() => import('./pages/patients/PatientMedicalRecords'));
const PatientEmergencyBookingsPage = lazy(() => import('./pages/patients/PatientEmergencyBookings'));

// Professional pages
const AllProfessionalsPage = lazy(() => import('./pages/professionals/AllProfessionals'));
const ProfessionalDetailPage = lazy(() => import('./pages/professionals/ProfessionalDetail'));
const ProfessionalServicesPage = lazy(() => import('./pages/professionals/ProfessionalServices'));
const ProfessionalApplicationsPage = lazy(() => import('./pages/professionals/ProfessionalApplications'));
const ProfessionalSchedulesPage = lazy(() => import('./pages/professionals/ProfessionalSchedules'));
const ProfessionalEarningsPage = lazy(() => import('./pages/professionals/ProfessionalEarnings'));
const ProfessionalVerificationPage = lazy(() => import('./pages/professionals/ProfessionalVerification'));

// Services pages
const AllServicesPage = lazy(() => import('./pages/AllServices'));

// Hospital pages
const AllHospitalsPage = lazy(() => import('./pages/hospitals/AllHospitals'));
const HospitalDetailPage = lazy(() => import('./pages/hospitals/HospitalDetail'));
const HospitalVacanciesPage = lazy(() => import('./pages/hospitals/HospitalVacancies'));
const HospitalApplicationsPage = lazy(() => import('./pages/hospitals/HospitalApplications'));
const HospitalSubscriptionsPage = lazy(() => import('./pages/hospitals/HospitalSubscriptions'));
const HospitalVerificationPage = lazy(() => import('./pages/hospitals/HospitalVerification'));

// Ambulance pages
const AllProvidersPage = lazy(() => import('./pages/ambulances/AllProviders'));
const ProviderDetailPage = lazy(() => import('./pages/ambulances/ProviderDetail'));
const EmergencyBookingsPage = lazy(() => import('./pages/ambulances/EmergencyBookings'));
const FleetManagementPage = lazy(() => import('./pages/ambulances/FleetManagement'));
const AvailabilityMonitoringPage = lazy(() => import('./pages/ambulances/AvailabilityMonitoring'));
const AmbulanceVerificationPage = lazy(() => import('./pages/ambulances/AmbulanceVerification'));

// Gym & Physiotherapy pages
const AllGymPhysioPage = lazy(() => import('./pages/gym-physio/AllGymPhysio'));
const GymPhysioDetailPage = lazy(() => import('./pages/gym-physio/GymPhysioDetail'));
const GymPhysioVerificationPage = lazy(() => import('./pages/gym-physio/GymPhysioVerification'));

// Settings pages
const SettingsPage = lazy(() => import('./pages/settings/Settings'));

const AdminRoutes: React.FC = () => {
  return (
    <AdminAuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<AdminLogin />} />

        {/* Protected routes with layout */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Routes>
                  <Route path="/overview" element={<OverviewPage />} />
                  <Route path="/" element={<Navigate to="/admin/overview" replace />} />
                  
                  {/* Patient Management Routes */}
                  <Route path="/patients" element={<AllPatientsPage />} />
                  <Route path="/patients/:patientId" element={<PatientDetailPage />} />
                  <Route path="/patients/:patientId/edit" element={<PatientEditPage />} />
                  <Route path="/patients/:patientId/appointments" element={<PatientAppointmentsPage />} />
                  <Route path="/patients/:patientId/records" element={<PatientMedicalRecordsPage />} />
                  <Route path="/patients/:patientId/emergencies" element={<PatientEmergencyBookingsPage />} />
                  
                  {/* Services Management Routes - Must come before professional routes */}
                  <Route path="/services" element={<AllServicesPage />} />
                  
                  {/* Professional Management Routes */}
                  <Route path="/professionals" element={<AllProfessionalsPage />} />
                  <Route path="/professionals/:professionalId" element={<ProfessionalDetailPage />} />
                  <Route path="/professionals/:professionalId/services" element={<ProfessionalServicesPage />} />
                  <Route path="/professionals/:professionalId/applications" element={<ProfessionalApplicationsPage />} />
                  <Route path="/professionals/:professionalId/schedules" element={<ProfessionalSchedulesPage />} />
                  <Route path="/professionals/:professionalId/earnings" element={<ProfessionalEarningsPage />} />
                  <Route path="/professionals/verification" element={<ProfessionalVerificationPage />} />
                  
                  {/* Hospital Management Routes */}
                  <Route path="/hospitals" element={<AllHospitalsPage />} />
                  <Route path="/hospitals/:hospitalId" element={<HospitalDetailPage />} />
                  <Route path="/hospitals/:hospitalId/vacancies" element={<HospitalVacanciesPage />} />
                  <Route path="/hospitals/:hospitalId/applications" element={<HospitalApplicationsPage />} />
                  <Route path="/hospitals/:hospitalId/subscriptions" element={<HospitalSubscriptionsPage />} />
                  <Route path="/hospitals/verification" element={<HospitalVerificationPage />} />
                  
                  {/* Ambulance Management Routes */}
                  <Route path="/ambulances" element={<AllProvidersPage />} />
                  <Route path="/ambulances/:providerId" element={<ProviderDetailPage />} />
                  <Route path="/ambulances/:providerId/fleet" element={<FleetManagementPage />} />
                  <Route path="/ambulances/bookings" element={<EmergencyBookingsPage />} />
                  <Route path="/ambulances/availability" element={<AvailabilityMonitoringPage />} />
                  <Route path="/ambulances/verification" element={<AmbulanceVerificationPage />} />
                  
                  {/* Gym & Physiotherapy Management Routes */}
                  <Route path="/gym-physio" element={<AllGymPhysioPage />} />
                  <Route path="/gym-physio/:id" element={<GymPhysioDetailPage />} />
                  <Route path="/gym-physio/verification" element={<GymPhysioVerificationPage />} />
                  
                  {/* Settings Routes */}
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AdminAuthProvider>
  );
};

export default AdminRoutes;
