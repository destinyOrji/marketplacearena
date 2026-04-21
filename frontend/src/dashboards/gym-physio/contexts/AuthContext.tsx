// Authentication Context for Gym & Physiotherapy Dashboard

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import type { GymPhysioProfile } from '../types';

interface AuthState {
  isAuthenticated: boolean;
  gymPhysio: GymPhysioProfile | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateGymPhysio: (gymPhysio: GymPhysioProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { gymPhysio: GymPhysioProfile; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_GYM_PHYSIO'; payload: GymPhysioProfile }
  | { type: 'SET_LOADING'; payload: boolean };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        gymPhysio: action.payload.gymPhysio,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        gymPhysio: null,
        token: null,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        isAuthenticated: false,
        gymPhysio: null,
        token: null,
        loading: false,
        error: null,
      };
    case 'UPDATE_GYM_PHYSIO':
      return {
        ...state,
        gymPhysio: action.payload,
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
  gymPhysio: null,
  token: null,
  loading: true,
  error: null,
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const checkAuth = async () => {
      const sharedToken = localStorage.getItem('authToken');
      const sharedUser = localStorage.getItem('user');
      
      const gymPhysioToken = localStorage.getItem('gymPhysioToken');
      const storedGymPhysio = localStorage.getItem('gymPhysio');

      let token = gymPhysioToken || sharedToken;
      let userStr = storedGymPhysio || sharedUser;

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          
          if (user.role === 'gym-physio') {
            if (!gymPhysioToken && sharedToken) {
              localStorage.setItem('gymPhysioToken', sharedToken);
              localStorage.setItem('gymPhysio', userStr);
            }

            const gymPhysio: GymPhysioProfile = {
              ...user,
              businessType: user.businessType || 'gym',
              businessName: user.businessName || '',
              licenseNumber: user.licenseNumber || '',
              specialization: user.specialization || '',
              yearsInBusiness: user.yearsInBusiness || 0,
              facilities: user.facilities || [],
              certifications: user.certifications || [],
              services: user.services || [],
              phone: user.phone || '',
              currency: user.currency || 'USD',
              averageRating: user.averageRating || 0,
              totalReviews: user.totalReviews || 0,
              totalBookings: user.totalBookings || 0,
              completedBookings: user.completedBookings || 0,
              isVerified: user.isVerified || false,
              isAvailable: user.isAvailable !== false,
              createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
              updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
            };
            
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { gymPhysio, token },
            });
          } else {
            const roleRoutes: Record<string, string> = {
              client: '/patient/dashboard',
              professional: '/professional/dashboard',
              hospital: '/hospital/dashboard',
              ambulance: '/ambulance/dashboard',
              admin: '/admin/dashboard',
            };
            const correctDashboard = roleRoutes[user.role] || '/patient/dashboard';
            window.location.href = correctDashboard;
          }
        } catch (error) {
          localStorage.removeItem('gymPhysioToken');
          localStorage.removeItem('gymPhysio');
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
      // This would call your actual login API
      throw new Error('Login not implemented - use main login');
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
      // Call logout API if needed
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('gymPhysioToken');
      localStorage.removeItem('gymPhysio');
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateGymPhysio = (gymPhysio: GymPhysioProfile) => {
    localStorage.setItem('gymPhysio', JSON.stringify(gymPhysio));
    dispatch({ type: 'UPDATE_GYM_PHYSIO', payload: gymPhysio });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        updateGymPhysio,
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
