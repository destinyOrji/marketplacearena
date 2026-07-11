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
const GymPhysioServicesPage = lazy(() => import('./pages/gym-physio/GymPhysioServices'));
const GymPhysioAppointmentsPage = lazy(() => import('./pages/gym-physio/GymPhysioAppointments'));
const GymPhysioEarningsPage = lazy(() => import('./pages/gym-physio/GymPhysioEarnings'));

// Settings pages
const SettingsPage = lazy(() => import('./pages/settings/Settings'));
const AdminUsersPage = lazy(() => import('./pages/settings/AdminUsers'));
const RolesPermissionsPage = lazy(() => import('./pages/settings/RolesPermissions'));
const SystemSettingsPage = lazy(() => import('./pages/settings/SystemSettings'));
const PaymentSettingsPage = lazy(() => import('./pages/settings/PaymentSettings'));
const EmailTemplatesPage = lazy(() => import('./pages/settings/EmailTemplates'));
const AuditLogsPage = lazy(() => import('./pages/settings/AuditLogs'));

// Patient aggregate pages
const AllAppointmentsPage = lazy(() => import('./pages/patients/AllAppointments'));
const AllMedicalRecordsPage = lazy(() => import('./pages/patients/AllMedicalRecords'));
const AllEmergencyBookingsPage = lazy(() => import('./pages/patients/AllEmergencyBookings'));
const AllPatientPaymentsPage = lazy(() => import('./pages/patients/AllPatientPayments'));

// Professional aggregate pages
const AllApplicationsPage = lazy(() => import('./pages/professionals/AllApplications'));
const AllSchedulesPage = lazy(() => import('./pages/professionals/AllSchedules'));
const AllEarningsPage = lazy(() => import('./pages/professionals/AllEarnings'));

// Hospital aggregate pages
const AllHospitalApplicationsPage = lazy(() => import('./pages/hospitals/AllHospitalApplications'));
const AdminApplicationDetailPage  = lazy(() => import('./pages/hospitals/AdminApplicationDetail'));
const AllHospitalSubscriptionsPage = lazy(() => import('./pages/hospitals/AllHospitalSubscriptions'));
const AllHospitalEarningsPage = lazy(() => import('./pages/hospitals/AllHospitalEarnings'));

// Ambulance aggregate pages
const AllFleetPage = lazy(() => import('./pages/ambulances/AllFleet'));
const AllAmbulanceEarningsPage = lazy(() => import('./pages/ambulances/AllAmbulanceEarnings'));

// Gym aggregate pages
const AllGymServicesPage = lazy(() => import('./pages/gym-physio/AllGymServices'));
const AllGymAppointmentsPage = lazy(() => import('./pages/gym-physio/AllGymAppointments'));
const AllGymEarningsPage = lazy(() => import('./pages/gym-physio/AllGymEarnings'));

// Pending approvals
const PendingApprovalsPage = lazy(() => import('./pages/PendingApprovals'));
const NotificationsPage = lazy(() => import('./pages/Notifications'));

// Blog management pages
const BlogManagementPage = lazy(() => import('./pages/BlogManagement'));
const BlogEditorPage = lazy(() => import('./pages/BlogEditor'));

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
                  <Route path="/pending-approvals" element={<PendingApprovalsPage />} />
                  <Route path="/" element={<Navigate to="/admin/overview" replace />} />
                  
                  {/* Patient Management Routes */}
                  <Route path="/patients" element={<AllPatientsPage />} />
                  <Route path="/patients/all-appointments" element={<AllAppointmentsPage />} />
                  <Route path="/patients/all-records" element={<AllMedicalRecordsPage />} />
                  <Route path="/patients/all-emergencies" element={<AllEmergencyBookingsPage />} />
                  <Route path="/patients/all-payments" element={<AllPatientPaymentsPage />} />
                  <Route path="/patients/:patientId" element={<PatientDetailPage />} />
                  <Route path="/patients/:patientId/edit" element={<PatientEditPage />} />
                  <Route path="/patients/:patientId/appointments" element={<PatientAppointmentsPage />} />
                  <Route path="/patients/:patientId/records" element={<PatientMedicalRecordsPage />} />
                  <Route path="/patients/:patientId/emergencies" element={<PatientEmergencyBookingsPage />} />
                  
                  {/* Services Management Routes - Must come before professional routes */}
                  <Route path="/services" element={<AllServicesPage />} />
                  
                  {/* Professional Management Routes */}
                  {/* ⚠️ Static routes MUST come before /:professionalId */}
                  <Route path="/professionals" element={<AllProfessionalsPage />} />
                  <Route path="/professionals/verification" element={<ProfessionalVerificationPage />} />
                  <Route path="/professionals/all-applications" element={<AllApplicationsPage />} />
                  <Route path="/professionals/all-schedules" element={<AllSchedulesPage />} />
                  <Route path="/professionals/all-earnings" element={<AllEarningsPage />} />
                  <Route path="/professionals/:professionalId" element={<ProfessionalDetailPage />} />
                  <Route path="/professionals/:professionalId/services" element={<ProfessionalServicesPage />} />
                  <Route path="/professionals/:professionalId/applications" element={<ProfessionalApplicationsPage />} />
                  <Route path="/professionals/:professionalId/schedules" element={<ProfessionalSchedulesPage />} />
                  <Route path="/professionals/:professionalId/earnings" element={<ProfessionalEarningsPage />} />
                  
                  {/* Hospital Management Routes */}
                  {/* ⚠️ Static routes MUST come before /:hospitalId */}
                  <Route path="/hospitals" element={<AllHospitalsPage />} />
                  <Route path="/hospitals/vacancies" element={<HospitalVacanciesPage />} />
                  <Route path="/hospitals/verification" element={<HospitalVerificationPage />} />
                  <Route path="/hospitals/all-applications" element={<AllHospitalApplicationsPage />} />
                  <Route path="/hospitals/all-applications/:hospitalId/:applicationId" element={<AdminApplicationDetailPage />} />
                  <Route path="/hospitals/all-subscriptions" element={<AllHospitalSubscriptionsPage />} />
                  <Route path="/hospitals/all-earnings" element={<AllHospitalEarningsPage />} />
                  <Route path="/hospitals/:hospitalId" element={<HospitalDetailPage />} />
                  <Route path="/hospitals/:hospitalId/vacancies" element={<HospitalVacanciesPage />} />
                  <Route path="/hospitals/:hospitalId/applications" element={<HospitalApplicationsPage />} />
                  <Route path="/hospitals/:hospitalId/subscriptions" element={<HospitalSubscriptionsPage />} />
                  
                  {/* Ambulance Management Routes */}
                  {/* ⚠️ Static routes MUST come before /:providerId */}
                  <Route path="/ambulances" element={<AllProvidersPage />} />
                  <Route path="/ambulances/service" element={<Navigate to="/admin/ambulances/all-fleet" replace />} />
                  <Route path="/ambulances/bookings" element={<EmergencyBookingsPage />} />
                  <Route path="/ambulances/availability" element={<AvailabilityMonitoringPage />} />
                  <Route path="/ambulances/verification" element={<AmbulanceVerificationPage />} />
                  <Route path="/ambulances/all-fleet" element={<AllFleetPage />} />
                  <Route path="/ambulances/all-earnings" element={<AllAmbulanceEarningsPage />} />
                  <Route path="/ambulances/:providerId" element={<ProviderDetailPage />} />
                  <Route path="/ambulances/:providerId/fleet" element={<FleetManagementPage />} />
                  
                  {/* Gym & Physiotherapy Management Routes */}
                  {/* ⚠️ Static routes MUST come before /:id */}
                  <Route path="/gym-physio" element={<AllGymPhysioPage />} />
                  <Route path="/gym-physio/verification" element={<GymPhysioVerificationPage />} />
                  <Route path="/gym-physio/all-services" element={<AllGymServicesPage />} />
                  <Route path="/gym-physio/all-appointments" element={<AllGymAppointmentsPage />} />
                  <Route path="/gym-physio/all-earnings" element={<AllGymEarningsPage />} />
                  <Route path="/gym-physio/:id" element={<GymPhysioDetailPage />} />
                  <Route path="/gym-physio/:id/services" element={<GymPhysioServicesPage />} />
                  <Route path="/gym-physio/:id/appointments" element={<GymPhysioAppointmentsPage />} />
                  <Route path="/gym-physio/:id/earnings" element={<GymPhysioEarningsPage />} />
                  
                  {/* Settings Routes */}
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/settings/users" element={<AdminUsersPage />} />
                  <Route path="/settings/roles" element={<RolesPermissionsPage />} />
                  <Route path="/settings/system" element={<SystemSettingsPage />} />
                  <Route path="/settings/payments" element={<PaymentSettingsPage />} />
                  <Route path="/settings/email-templates" element={<EmailTemplatesPage />} />
                  <Route path="/settings/audit-logs" element={<AuditLogsPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  
                  {/* Blog Management Routes */}
                  <Route path="/blog" element={<BlogManagementPage />} />
                  <Route path="/blog/create" element={<BlogEditorPage />} />
                  <Route path="/blog/edit/:id" element={<BlogEditorPage />} />
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
