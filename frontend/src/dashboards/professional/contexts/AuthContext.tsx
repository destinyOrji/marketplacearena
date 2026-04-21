// Authentication Context for Professional Dashboard

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, Professional } from '../types';
import { authApi, profileApi } from '../services';
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfessional: (professional: Professional) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { professional: Professional; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PROFESSIONAL'; payload: Professional }
  | { type: 'SET_LOADING'; payload: boolean };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        professional: action.payload.professional,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        professional: null,
        token: null,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        isAuthenticated: false,
        professional: null,
        token: null,
        loading: false,
        error: null,
      };
    case 'UPDATE_PROFESSIONAL':
      return {
        ...state,
        professional: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  isAuthenticated: false,
  professional: null,
  token: null,
  loading: true,
  error: null,
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      // Check for shared auth token first (from main login)
      const sharedToken = localStorage.getItem('authToken');
      const sharedUser = localStorage.getItem('user');
      
      // Check for professional-specific token
      const professionalToken = localStorage.getItem('professionalToken');
      const storedProfessional = localStorage.getItem('professional');

      let token = professionalToken || sharedToken;
      let userStr = storedProfessional || sharedUser;

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          
          // Verify this is a professional user
          if (user.role === 'professional') {
            // Store professional-specific tokens if using shared tokens
            if (!professionalToken && sharedToken) {
              localStorage.setItem('professionalToken', sharedToken);
              localStorage.setItem('professional', userStr);
            }

            // Normalize API user object into Professional shape
            const professional: Professional = {
              ...user,
              fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Professional',
              specialization: user.specialization
                ? Array.isArray(user.specialization) ? user.specialization : [user.specialization]
                : [],
              yearsOfExperience: user.yearsOfExperience || 0,
              licenseNumber: user.licenseNumber || '',
              rating: user.averageRating || 0,
              reviewCount: user.totalReviews || 0,
              completionPercentage: 0,
              verificationStatus: user.isVerified ? 'verified' : 'pending',
              createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
            };
            
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { professional, token },
            });
          } else {
            // Not a professional user, redirect to correct dashboard
            const roleRoutes: Record<string, string> = {
              client: '/patient/dashboard',
              hospital: '/hospital/dashboard',
              ambulance: '/ambulance/dashboard',
              admin: '/admin/dashboard',
            };
            const correctDashboard = roleRoutes[user.role] || '/patient/dashboard';
            window.location.href = correctDashboard;
          }
        } catch (error) {
          // Token invalid, clear storage
          localStorage.removeItem('professionalToken');
          localStorage.removeItem('professional');
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await authApi.login(email, password);
      const { professional, token } = response;

      localStorage.setItem('professionalToken', token);
      localStorage.setItem('professional', JSON.stringify(professional));

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { professional, token },
      });
    } catch (error: any) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.message || 'Login failed',
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('professionalToken');
      localStorage.removeItem('professional');
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateProfessional = (professional: Professional) => {
    localStorage.setItem('professional', JSON.stringify(professional));
    dispatch({ type: 'UPDATE_PROFESSIONAL', payload: professional });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        updateProfessional,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
