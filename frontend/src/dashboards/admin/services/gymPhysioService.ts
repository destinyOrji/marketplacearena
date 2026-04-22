/**
 * Gym & Physiotherapy Service
 * Handles all gym-physio-related API calls for admin
 */
import axios from 'axios';
import { authService } from './authService';
import { ApiResponse, PaginationMeta } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

interface GymPhysioProvider {
  id: string;
  businessName: string;
  businessType: string;
  email: string;
  phone: string;
  licenseNumber: string;
  specialization: string[];
  yearsInBusiness: number;
  address: string;
  city: string;
  state: string;
  country: string;
  isVerified: boolean;
  isActive: boolean;
  averageRating: number;
  totalReviews: number;
  totalBookings: number;
  completedBookings: number;
  createdAt: string;
  updatedAt: string;
}

interface GymPhysioListParams {
  page?: number;
  page_size?: number;
  search?: string;
  business_type?: string;
  verification_status?: string;
  city?: string;
  state?: string;
}

interface PaginatedResponse<T> {
  statuscode: number;
  status: string;
  message: string;
  data: T[];
  pagination: PaginationMeta;
}

class GymPhysioServiceClass {
  private readonly baseURL = `${API_BASE_URL}/admin/gym-physio`;

  private getAuthHeaders() {
    const token = authService.getAccessToken();
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  }

  /**
   * Get list of all gym-physio providers with pagination and filters
   */
  async getProviders(params: GymPhysioListParams = {}): Promise<PaginatedResponse<GymPhysioProvider>> {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.page_size) queryParams.append('page_size', params.page_size.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.business_type) queryParams.append('business_type', params.business_type);
      if (params.verification_status) queryParams.append('verification_status', params.verification_status);
      if (params.city) queryParams.append('city', params.city);
      if (params.state) queryParams.append('state', params.state);

      const response = await axios.get<PaginatedResponse<GymPhysioProvider>>(
        `${this.baseURL}/?${queryParams.toString()}`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch gym-physio providers:', error);
      throw error;
    }
  }

  /**
   * Get provider details by ID
   */
  async getProviderById(providerId: string): Promise<GymPhysioProvider> {
    try {
      const response = await axios.get<ApiResponse<GymPhysioProvider>>(
        `${this.baseURL}/${providerId}/`,
        this.getAuthHeaders()
      );
      return response.data.data!;
    } catch (error: any) {
      console.error('Failed to fetch provider details:', error);
      throw error;
    }
  }

  /**
   * Update provider details
   */
  async updateProvider(providerId: string, data: Partial<GymPhysioProvider>): Promise<void> {
    try {
      await axios.put(
        `${this.baseURL}/${providerId}/update/`,
        data,
        this.getAuthHeaders()
      );
    } catch (error: any) {
      console.error('Failed to update provider:', error);
      throw error;
    }
  }

  /**
   * Delete provider
   */
  async deleteProvider(providerId: string): Promise<void> {
    try {
      await axios.delete(
        `${this.baseURL}/${providerId}/delete/`,
        this.getAuthHeaders()
      );
    } catch (error: any) {
      console.error('Failed to delete provider:', error);
      throw error;
    }
  }

  /**
   * Get pending verification providers
   */
  async getPendingVerifications(): Promise<GymPhysioProvider[]> {
    try {
      const response = await axios.get<ApiResponse<GymPhysioProvider[]>>(
        `${this.baseURL}/verification/pending/`,
        this.getAuthHeaders()
      );
      return response.data.data || [];
    } catch (error: any) {
      console.error('Failed to fetch pending verifications:', error);
      return [];
    }
  }

  /**
   * Verify provider
   */
  async verifyProvider(providerId: string): Promise<void> {
    try {
      await axios.post(
        `${this.baseURL}/${providerId}/verify/`,
        {},
        this.getAuthHeaders()
      );
    } catch (error: any) {
      console.error('Failed to verify provider:', error);
      throw error;
    }
  }

  /**
   * Reject provider verification
   */
  async rejectProvider(providerId: string, reason: string): Promise<void> {
    try {
      await axios.post(
        `${this.baseURL}/${providerId}/reject/`,
        { reason },
        this.getAuthHeaders()
      );
    } catch (error: any) {
      console.error('Failed to reject provider:', error);
      throw error;
    }
  }

  /**
   * Toggle provider active status
   */
  async toggleProviderStatus(providerId: string, isActive: boolean): Promise<void> {
    try {
      await axios.patch(
        `${this.baseURL}/${providerId}/status/`,
        { isActive },
        this.getAuthHeaders()
      );
    } catch (error: any) {
      console.error('Failed to toggle provider status:', error);
      throw error;
    }
  }
}

export const gymPhysioService = new GymPhysioServiceClass();
