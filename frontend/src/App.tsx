import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/services-page';
import ContactPage from './pages/ContactPage';
import ProfessionalPage from './pages/ProfessionalPage';
import HospitalPage from './pages/HospitalPage';
import AmbulancePage from './pages/AmbulancePage';
import OurTeamPage from './pages/OurTeamPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import CompliancePage from './pages/CompliancePage';
import UserTypeSelection from './pages/auth/UserTypeSelection';
import Login from './pages/auth/Login';
import { AuthProvider } from './dashboards/patient/contexts/AuthContext';
import { NotificationProvider } from './dashboards/patient/contexts/NotificationContext';
import { ProtectedRoute } from './dashboards/patient/components';
import { Loading } from './dashboards/patient/components';

// Lazy load admin dashboard
const AdminRoutes = lazy(() => import('./dashboards/admin/routes'));

// Lazy load professional dashboard
const ProfessionalRoutes = lazy(() => import('./dashboards/professional/index'));

// Lazy load hospital dashboard
const HospitalRoutes = lazy(() => import('./dashboards/hospital/routes'));

// Lazy load emergency/ambulance dashboard
const EmergencyRoutes = lazy(() => import('./dashboards/emergency/routes'));

// Lazy load gym-physio dashboard
const GymPhysioRoutes = lazy(() => import('./dashboards/gym-physio/index'));

// Lazy load patient dashboard pages for code splitting
const PatientLogin = lazy(() => import('./dashboards/patient/pages/Login'));
const ForgotPassword = lazy(() => import('./dashboards/patient/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./dashboards/patient/pages/ResetPassword'));
const DashboardHome = lazy(() => import('./dashboards/patient/pages/DashboardHome'));
const BrowseServices = lazy(() => import('./dashboards/patient/pages/BrowseServices'));
const BookConsultation = lazy(() => import('./dashboards/patient/pages/BookConsultation'));
const EmergencyServices = lazy(() => import('./dashboards/patient/pages/EmergencyServices'));
const MyAppointments = lazy(() => import('./dashboards/patient/pages/MyAppointments'));
const MedicalRecords = lazy(() => import('./dashboards/patient/pages/MedicalRecords'));
const Payments = lazy(() => import('./dashboards/patient/pages/Payments'));
const Feedback = lazy(() => import('./dashboards/patient/pages/Feedback'));
const ProfileSettings = lazy(() => import('./dashboards/patient/pages/ProfileSettings'));
const Subscription = lazy(() => import('./dashboards/patient/pages/Subscription'));

// Lazy load registration pages
const PatientRegister = lazy(() => import('./pages/auth/PatientRegister'));
const PatientOTPVerify = lazy(() => import('./pages/auth/PatientOTPVerify'));
const PatientRegisterStep2 = lazy(() => import('./pages/auth/PatientRegisterStep2'));
const ProfessionalRegister = lazy(() => import('./pages/auth/ProfessionalRegister'));
const ProfessionalRegisterOTPVerify = lazy(() => import('./pages/auth/ProfessionalRegisterOTPVerify'));
const HospitalRegister = lazy(() => import('./pages/auth/HospitalRegister'));
const HospitalRegisterOTPVerify = lazy(() => import('./pages/auth/HospitalRegisterOTPVerify'));
const AmbulanceRegister = lazy(() => import('./pages/auth/AmbulanceRegister'));
const AmbulanceRegisterOTPVerify = lazy(() => import('./pages/auth/AmbulanceRegisterOTPVerify'));
const GymPhysioRegister = lazy(() => import('./pages/auth/GymPhysioRegister'));
const GymPhysioRegisterStep2 = lazy(() => import('./pages/auth/GymPhysioRegisterStep2'));
const GymPhysioRegisterStep3 = lazy(() => import('./pages/auth/GymPhysioRegisterStep3'));
const GymPhysioRegisterStep4 = lazy(() => import('./pages/auth/GymPhysioRegisterStep4'));
const GymPhysioRegisterStep5 = lazy(() => import('./pages/auth/GymPhysioRegisterStep5'));

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          style={{ zIndex: 9999 }}
        />
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/professionals" element={<ProfessionalPage />} />
            <Route path="/hospitals" element={<HospitalPage />} />
            <Route path="/ambulance" element={<AmbulancePage />} />
            <Route path="/our-team" element={<OurTeamPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/compliance" element={<CompliancePage />} />
            <Route path="/get-started" element={<UserTypeSelection />} />
            <Route path="/login" element={<Login />} />
            
            {/* Redirect old routes to new simplified routes */}
            <Route path="/auth/get-started" element={<Navigate to="/get-started" replace />} />
            <Route path="/auth/login" element={<Navigate to="/login" replace />} />
            <Route path="/patient/login" element={<Navigate to="/login" replace />} />
            <Route path="/professional/login" element={<Navigate to="/login" replace />} />
            <Route path="/hospital/login" element={<Navigate to="/login" replace />} />
            <Route path="/ambulance/login" element={<Navigate to="/login" replace />} />
            
            {/* Admin Dashboard Routes */}
            <Route path="/admin/*" element={<AdminRoutes />} />
            
            {/* Professional Dashboard Routes */}
            <Route path="/professional/*" element={<ProfessionalRoutes />} />
            
            {/* Hospital Dashboard Routes */}
            <Route path="/hospital/*" element={<HospitalRoutes />} />
            
            {/* Ambulance/Emergency Dashboard Routes */}
            <Route path="/ambulance/*" element={<EmergencyRoutes />} />
            
            {/* Gym & Physiotherapy Dashboard Routes */}
            <Route path="/gym-physio/*" element={<GymPhysioRoutes />} />
            
            {/* Patient Dashboard Routes */}
            <Route path="/patient/login" element={<PatientLogin />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Redirect old forgot password routes */}
            <Route path="/patient/forgot-password" element={<Navigate to="/forgot-password" replace />} />
            <Route path="/auth/forgot-password" element={<Navigate to="/forgot-password" replace />} />
            <Route path="/auth/reset-password" element={<Navigate to="/reset-password" replace />} />
            
            {/* Protected Patient Dashboard Routes */}
            <Route 
              path="/patient/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardHome />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/patient/dashboard/home" 
              element={
                <ProtectedRoute>
                  <DashboardHome />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/patient/browse-services" 
              element={
                <ProtectedRoute>
                  <BrowseServices />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/patient/book-consultation" 
              element={
                <ProtectedRoute>
                  <BookConsultation />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/patient/emergency" 
              element={
                <ProtectedRoute>
                  <EmergencyServices />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/patient/appointments" 
              element={
                <ProtectedRoute>
                  <MyAppointments />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/patient/medical-records" 
              element={
                <ProtectedRoute>
                  <MedicalRecords />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/patient/payments" 
              element={
                <ProtectedRoute>
                  <Payments />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/patient/feedback" 
              element={
                <ProtectedRoute>
                  <Feedback />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/patient/profile" 
              element={
                <ProtectedRoute>
                  <ProfileSettings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/patient/subscription" 
              element={
                <ProtectedRoute>
                  <Subscription />
                </ProtectedRoute>
              } 
            />
            
            {/* Patient Registration Routes */}
            <Route path="/register" element={<PatientRegister />} />
            <Route path="/register/patient/otp-verify" element={<PatientOTPVerify />} />
            <Route path="/register/patient/step2" element={<PatientRegisterStep2 />} />
            
            {/* Professional Registration Routes */}
            <Route path="/register/professional" element={<ProfessionalRegister />} />
            <Route path="/register/professional/otp-verify" element={<ProfessionalRegisterOTPVerify />} />
            
            {/* Hospital Registration Routes */}
            <Route path="/register/hospital" element={<HospitalRegister />} />
            <Route path="/register/hospital/otp-verify" element={<HospitalRegisterOTPVerify />} />
            
            {/* Ambulance Registration Routes */}
            <Route path="/register/ambulance" element={<AmbulanceRegister />} />
            <Route path="/register/ambulance/otp-verify" element={<AmbulanceRegisterOTPVerify />} />
            
            {/* Gym & Physiotherapy Registration Routes */}
            <Route path="/register/gym-physio" element={<GymPhysioRegister />} />
            <Route path="/register/gym-physio/step2" element={<GymPhysioRegisterStep2 />} />
            <Route path="/register/gym-physio/step3" element={<GymPhysioRegisterStep3 />} />
            <Route path="/register/gym-physio/step4" element={<GymPhysioRegisterStep4 />} />
            <Route path="/register/gym-physio/step5" element={<GymPhysioRegisterStep5 />} />
            
            {/* Redirect old auth routes to new simplified routes */}
            <Route path="/auth/register" element={<Navigate to="/register" replace />} />
            <Route path="/auth/register/patient/otp-verify" element={<Navigate to="/register/patient/otp-verify" replace />} />
            <Route path="/auth/register/patient/step2" element={<Navigate to="/register/patient/step2" replace />} />
            <Route path="/auth/register/patient/step3" element={<Navigate to="/register/patient/step3" replace />} />
            <Route path="/auth/register/patient/step4" element={<Navigate to="/register/patient/step4" replace />} />
            <Route path="/auth/register/professional" element={<Navigate to="/register/professional" replace />} />
            <Route path="/auth/register/professional/step2" element={<Navigate to="/register/professional/step2" replace />} />
            <Route path="/auth/register/professional/step3" element={<Navigate to="/register/professional/step3" replace />} />
            <Route path="/auth/register/professional/step4" element={<Navigate to="/register/professional/step4" replace />} />
            <Route path="/auth/register/professional/step5" element={<Navigate to="/register/professional/step5" replace />} />
            <Route path="/auth/register/hospital" element={<Navigate to="/register/hospital" replace />} />
            <Route path="/auth/register/hospital/step2" element={<Navigate to="/register/hospital/step2" replace />} />
            <Route path="/auth/register/hospital/step3" element={<Navigate to="/register/hospital/step3" replace />} />
            <Route path="/auth/register/hospital/step4" element={<Navigate to="/register/hospital/step4" replace />} />
            <Route path="/auth/register/hospital/step5" element={<Navigate to="/register/hospital/step5" replace />} />
            <Route path="/auth/register/ambulance" element={<Navigate to="/register/ambulance" replace />} />
            <Route path="/auth/register/ambulance/step2" element={<Navigate to="/register/ambulance/step2" replace />} />
            <Route path="/auth/register/ambulance/step3" element={<Navigate to="/register/ambulance/step3" replace />} />
            <Route path="/auth/register/ambulance/step4" element={<Navigate to="/register/ambulance/step4" replace />} />
            <Route path="/auth/register/ambulance/step5" element={<Navigate to="/register/ambulance/step5" replace />} />
          </Routes>
        </Suspense>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
