/**
 * Dashboard Service
 * Handles all dashboard-related API calls
 */
import axios from 'axios';
import { authService } from './authService';
import {
  DashboardStats,
  RegistrationTrend,
  AppointmentStats,
  EmergencyStats,
  RevenueDistribution,
  RecentActivity
} from '../types/dashboard';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api/v1';

interface ApiResponse<T> {
  statuscode: number;
  status: string;
  message?: string;
  data: T;
}

class DashboardService {
  private readonly baseURL = `${API_BASE_URL}/admin/dashboard`;

  private getAuthHeaders() {
    const token = authService.getAccessToken();
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  }

  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<DashboardStats> {
    try {
      const response = await axios.get<ApiResponse<DashboardStats>>(
        `${this.baseURL}/stats`,
        this.getAuthHeaders()
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to fetch dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Get registration trends
   */
  async getRegistrationTrends(startDate?: string, endDate?: string): Promise<RegistrationTrend[]> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await axios.get<ApiResponse<RegistrationTrend[]>>(
        `${this.baseURL}/registration-trends?${params.toString()}`,
        this.getAuthHeaders()
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to fetch registration trends:', error);
      throw error;
    }
  }

  /**
   * Get appointment statistics
   */
  async getAppointmentStats(): Promise<AppointmentStats[]> {
    try {
      const response = await axios.get<ApiResponse<AppointmentStats[]>>(
        `${this.baseURL}/appointment-stats`,
        this.getAuthHeaders()
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to fetch appointment stats:', error);
      throw error;
    }
  }

  /**
   * Get emergency booking statistics
   */
  async getEmergencyStats(): Promise<EmergencyStats[]> {
    try {
      const response = await axios.get<ApiResponse<EmergencyStats[]>>(
        `${this.baseURL}/emergency-stats`,
        this.getAuthHeaders()
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to fetch emergency stats:', error);
      throw error;
    }
  }

  /**
   * Get revenue distribution
   */
  async getRevenueDistribution(): Promise<RevenueDistribution[]> {
    try {
      const response = await axios.get<ApiResponse<RevenueDistribution[]>>(
        `${this.baseURL}/revenue-distribution`,
        this.getAuthHeaders()
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to fetch revenue distribution:', error);
      throw error;
    }
  }

  /**
   * Get recent activities
   */
  async getRecentActivities(): Promise<RecentActivity[]> {
    try {
      const response = await axios.get<ApiResponse<RecentActivity[]>>(
        `${this.baseURL}/recent-activities`,
        this.getAuthHeaders()
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to fetch recent activities:', error);
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();
