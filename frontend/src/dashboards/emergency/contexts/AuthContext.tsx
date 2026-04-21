// Auth Context - Manage authentication state

import React, { createContext, useContext, useState, useEffect } from 'react';
import { EmergencyProvider, AuthState } from '../types';
import { authApi, profileApi } from '../services/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    provider: null,
    token: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Check for shared auth token first (from main login)
    const sharedToken = localStorage.getItem('authToken');
    const sharedUser = localStorage.getItem('user');
    
    // Check for emergency-specific token
    const emergencyToken = localStorage.getItem('emergency_token');
    const ambulanceToken = localStorage.getItem('ambulanceToken');
    const storedAmbulance = localStorage.getItem('ambulance');

    let token = emergencyToken || ambulanceToken || sharedToken;
    let userStr = storedAmbulance || sharedUser;

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        
        // Verify this is an ambulance user
        if (user.role === 'ambulance') {
          // Store emergency-specific tokens if using shared tokens
          if (!emergencyToken && token) {
            localStorage.setItem('emergency_token', token);
            if (!storedAmbulance) {
              localStorage.setItem('ambulance', userStr);
            }
          }
          
          setAuthState({
            isAuthenticated: true,
            provider: user,
            token,
            loading: false,
            error: null,
          });
        } else {
          // Not an ambulance user, redirect to correct dashboard
          const roleRoutes: Record<string, string> = {
            client: '/patient/dashboard',
            professional: '/professional/dashboard',
            hospital: '/hospital/dashboard',
            admin: '/admin/dashboard',
          };
          const correctDashboard = roleRoutes[user.role] || '/patient/dashboard';
          window.location.href = correctDashboard;
        }
      } catch (error) {
        // Token invalid, clear storage
        localStorage.removeItem('emergency_token');
        localStorage.removeItem('ambulanceToken');
        localStorage.removeItem('ambulance');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setAuthState({
          isAuthenticated: false,
          provider: null,
          token: null,
          loading: false,
          error: 'Session expired',
        });
      }
    } else {
      setAuthState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  const loadProfile = async (token: string) => {
    try {
      const provider = await profileApi.getProfile();
      setAuthState({
        isAuthenticated: true,
        provider,
        token,
        loading: false,
        error: null,
      });
    } catch (error) {
      localStorage.removeItem('emergency_token');
      setAuthState({
        isAuthenticated: false,
        provider: null,
        token: null,
        loading: false,
        error: 'Session expired',
      });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { token, provider } = await authApi.login(email, password);
      localStorage.setItem('emergency_token', token);
      setAuthState({
        isAuthenticated: true,
        provider,
        token,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('emergency_token');
      setAuthState({
        isAuthenticated: false,
        provider: null,
        token: null,
        loading: false,
        error: null,
      });
    }
  };

  const refreshProfile = async () => {
    if (!authState.token) return;
    try {
      const provider = await profileApi.getProfile();
      setAuthState((prev) => ({ ...prev, provider }));
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
