/**
 * Hospital Context
 * Global state management for hospital dashboard
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { hospitalApi } from '../services/api';
import type { Hospital, DashboardStats } from '../types';

interface HospitalContextType {
  hospital: Hospital | null;
  dashboardStats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  refreshHospital: () => Promise<void>;
  refreshDashboardStats: () => Promise<void>;
  updateHospital: (data: Partial<Hospital>) => Promise<void>;
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error('useHospital must be used within HospitalProvider');
  }
  return context;
};

interface HospitalProviderProps {
  children: ReactNode;
}

export const HospitalProvider: React.FC<HospitalProviderProps> = ({ children }) => {
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshHospital = async () => {
    try {
      setLoading(true);
      setError(null);
      try {
        const res = await hospitalApi.getProfile();
        // Handle both direct data and wrapped response
        const data = (res as any)?.data || res;
        setHospital(data);
      } catch {
        // Fall back to user data from localStorage
        const userStr = localStorage.getItem('hospital') || localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setHospital({
            hospitalName: user.hospitalName || user.firstName + ' ' + user.lastName,
            hospital_name: user.hospitalName || user.firstName + ' ' + user.lastName,
            email: user.email,
            isVerified: user.isVerified || false,
            verification_status: user.isVerified ? 'verified' : 'pending',
            onboarding_completed: true,
          } as any);
        }
      }
    } catch (err: any) {
      setError('Failed to load hospital profile');
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboardStats = async () => {
    try {
      const res = await hospitalApi.getDashboardStats();
      const data = (res as any)?.data || res;
      setDashboardStats(data);
    } catch (err: any) {
      console.error('Error loading dashboard stats:', err);
    }
  };

  const updateHospital = async (data: Partial<Hospital>) => {
    try {
      const updated = await hospitalApi.updateProfile(data);
      setHospital(updated);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to update hospital profile');
    }
  };

  useEffect(() => {
    refreshHospital();
    refreshDashboardStats();
  }, []);

  const value: HospitalContextType = {
    hospital,
    dashboardStats,
    loading,
    error,
    refreshHospital,
    refreshDashboardStats,
    updateHospital,
  };

  return <HospitalContext.Provider value={value}>{children}</HospitalContext.Provider>;
};
