import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';
import { authApi } from '../services/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<any>;
  verifyOTP: (email: string, otp_code: string) => Promise<any>;
  resendOTP: (email: string) => Promise<any>;
  uploadDocuments: (formData: FormData) => Promise<any>;
  createPassword: (user_id: number, password: string, confirm_password: string) => Promise<any>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true,
    error: null,
  });

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setAuthState({
          isAuthenticated: true,
          user,
          token,
          loading: false,
          error: null,
        });
      } catch (error) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setAuthState({ isAuthenticated: false, user: null, token: null, loading: false, error: null });
      }
    } else {
      setAuthState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      
      const response = await authApi.login(email, password);
      
      // Support both Node.js (success) and legacy (statuscode) response formats
      const resData = response.data as any;
      if (resData.success === false || resData.statuscode === 1) {
        throw new Error(resData.message || 'Login failed');
      }

      const { user, token } = resData.data || resData;

      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));

      setAuthState({
        isAuthenticated: true,
        user,
        token: token,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw new Error(errorMessage);
    }
  };

  const register = async (data: any) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      
      const response = await authApi.register(data);
      
      // Support both Node.js (success) and legacy (statuscode) response formats
      const resData = response.data as any;
      if (resData.success === false || resData.statuscode === 1) {
        throw new Error(resData.message || 'Registration failed');
      }

      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: null,
      }));

      // Return the response data for further processing (OTP verification, etc.)
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      const errorDetails = error.response?.data?.errors || {};
      
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      
      // Include validation errors in the thrown error
      const registrationError = new Error(errorMessage);
      (registrationError as any).errors = errorDetails;
      throw registrationError;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
      error: null,
    });
  };

  const verifyOTP = async (email: string, otp_code: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      
      const response = await authApi.verifyOTP(email, otp_code);
      
      const resData = response.data as any;
      if (resData.success === false || resData.statuscode === 1) {
        throw new Error(resData.message || 'OTP verification failed');
      }

      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: null,
      }));

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'OTP verification failed';
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw new Error(errorMessage);
    }
  };

  const resendOTP = async (email: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      
      const response = await authApi.resendOTP(email);
      
      const resData = response.data as any;
      if (resData.success === false || resData.statuscode === 1) {
        throw new Error(resData.message || 'Failed to resend OTP');
      }

      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: null,
      }));

      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to resend OTP';
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw new Error(errorMessage);
    }
  };

  const uploadDocuments = async (formData: FormData) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      
      // TODO: Implement document upload in Node.js backend
      console.log('Document upload not implemented yet');
      
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: null,
      }));

      return { statuscode: 0, message: 'Document upload feature coming soon' };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Document upload failed';
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw new Error(errorMessage);
    }
  };

  const createPassword = async (user_id: number, password: string, confirm_password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      
      // TODO: Implement password creation in Node.js backend
      console.log('Password creation not implemented yet');
      
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: null,
      }));

      return { statuscode: 0, message: 'Password creation feature coming soon' };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Password creation failed';
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw new Error(errorMessage);
    }
  };

  const updateUser = (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    setAuthState((prev) => ({ ...prev, user }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        verifyOTP,
        resendOTP,
        uploadDocuments,
        createPassword,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
