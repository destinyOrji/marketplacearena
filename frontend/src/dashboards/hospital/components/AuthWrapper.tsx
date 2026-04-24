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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      // Check for shared auth token (from main login)
      const sharedToken = localStorage.getItem('authToken');
      const sharedUser = localStorage.getItem('user');
      
      // Check for hospital-specific token
      const hospitalToken = localStorage.getItem('hospitalToken');
      const storedHospital = localStorage.getItem('hospital');

      const token = hospitalToken || sharedToken;
      const userStr = storedHospital || sharedUser;

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          
          if (user.role === 'hospital') {
            // Store hospital-specific tokens if using shared tokens
            if (!hospitalToken && sharedToken) {
              localStorage.setItem('hospitalToken', sharedToken);
              localStorage.setItem('hospital', userStr);
            }
            
            setIsAuthenticated(true);
            setUserRole(user.role);
          } else {
            // Not a hospital user, redirect to correct dashboard
            const roleRoutes: Record<string, string> = {
              client: '/patient/dashboard',
              professional: '/professional/dashboard',
              ambulance: '/ambulance/dashboard',
              admin: '/admin/dashboard',
            };
            const correctDashboard = roleRoutes[user.role] || '/patient/dashboard';
            window.location.href = correctDashboard;
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Wrong role, already handled by redirect above
  if (userRole !== 'hospital') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  // Authenticated and correct role
  return <>{children}</>;
};

export default AuthWrapper;
