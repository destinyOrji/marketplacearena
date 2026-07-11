/**
 * Authentication wrapper for Hospital dashboard
 * Checks if user is authenticated and has hospital role
 */
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const [authState, setAuthState] = useState<'loading' | 'ok' | 'no_auth' | 'wrong_role'>('loading');
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Check every possible key where the token/user could be stored
        const token =
          localStorage.getItem('hospitalToken') ||
          localStorage.getItem('authToken');

        const userStr =
          localStorage.getItem('hospital') ||
          localStorage.getItem('user');

        if (!token || !userStr) {
          setAuthState('no_auth');
          return;
        }

        const user = JSON.parse(userStr);
        const role: string = (user.role || '').toLowerCase().trim();

        if (role === 'hospital') {
          // Ensure both hospital-specific keys are set so HospitalApiService picks up the token
          if (!localStorage.getItem('hospitalToken')) {
            localStorage.setItem('hospitalToken', token);
          }
          if (!localStorage.getItem('hospital')) {
            localStorage.setItem('hospital', userStr);
          }
          setAuthState('ok');
        } else {
          // Logged in but wrong role — redirect to the correct dashboard
          const roleRoutes: Record<string, string> = {
            client: '/patient/dashboard',
            patient: '/patient/dashboard',
            professional: '/professional/dashboard',
            ambulance: '/ambulance/dashboard',
            'gym-physio': '/gym-physio/dashboard',
            admin: '/admin/dashboard',
            super_admin: '/admin/dashboard',
          };
          setRedirectTo(roleRoutes[role] || '/patient/dashboard');
          setAuthState('wrong_role');
        }
      } catch (error) {
        console.error('AuthWrapper: error reading auth state', error);
        setAuthState('no_auth');
      }
    };

    checkAuth();
  }, []);

  if (authState === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (authState === 'no_auth') {
    return <Navigate to="/login" replace />;
  }

  if (authState === 'wrong_role' && redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  // authState === 'ok'
  return <>{children}</>;
};

export default AuthWrapper;
