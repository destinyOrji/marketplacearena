/**
 * Ambulance Service
 * Handles all ambulance/emergency-related API calls
 */
import axios from 'axios';
import { authService } from './authService';
import {
  AmbulanceProvider,
  AmbulanceProviderListParams,
  EmergencyBooking,
  Vehicle,
  ProviderAvailability,
  AmbulanceDocument,
  ApiResponse,
  PaginationMeta
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api/v1';

interface PaginatedResponse<T> {
  statuscode: number;
  status: string;
  message: string;
  data: T[];
  pagination: PaginationMeta;
}

class AmbulanceServiceClass {
  private readonly baseURL = `${API_BASE_URL}/admin/ambulances`;

  private getAuthHeaders() {
    const token = authService.getAccessToken();
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  }

  /**
   * Get list of all ambulance providers with pagination and filters
   */
  async getProviders(params: AmbulanceProviderListParams = {}): Promise<PaginatedResponse<AmbulanceProvider>> {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.page_size) queryParams.append('page_size', params.page_size.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.service_type) queryParams.append('service_type', params.service_type);
      if (params.verification_status) queryParams.append('verification_status', params.verification_status);

      const response = await axios.get<PaginatedResponse<AmbulanceProvider>>(
        `${this.baseURL}/?${queryParams.toString()}`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch ambulance providers:', error);
      throw error;
    }
  }

  /**
   * Get provider details by ID
   */
  async getProviderById(providerId: string): Promise<AmbulanceProvider> {
    try {
      const response = await axios.get<ApiResponse<AmbulanceProvider>>(
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
  async updateProvider(providerId: string, data: Partial<AmbulanceProvider>): Promise<void> {
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
   * Get emergency bookings
   */
  async getEmergencyBookings(params: { provider_id?: string; status?: string; start_date?: string; end_date?: string } = {}): Promise<EmergencyBooking[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params.provider_id) queryParams.append('provider_id', params.provider_id);
      if (params.status) queryParams.append('status', params.status);
      if (params.start_date) queryParams.append('start_date', params.start_date);
      if (params.end_date) queryParams.append('end_date', params.end_date);

      const response = await axios.get<ApiResponse<EmergencyBooking[]>>(
        `${this.baseURL}/bookings/?${queryParams.toString()}`,
        this.getAuthHeaders()
      );
      return response.data.data || [];
    } catch (error: any) {
      console.error('Failed to fetch emergency bookings:', error);
      return [];
    }
  }

  /**
   * Get provider vehicles
   */
  async getProviderVehicles(providerId: string): Promise<Vehicle[]> {
    try {
      const response = await axios.get<ApiResponse<Vehicle[]>>(
        `${this.baseURL}/${providerId}/vehicles/`,
        this.getAuthHeaders()
      );
      return response.data.data || [];
    } catch (error: any) {
      console.error('Failed to fetch provider vehicles:', error);
      return [];
    }
  }

  /**
   * Toggle vehicle status
   */
  async toggleVehicleStatus(providerId: string, vehicleId: string, status: string): Promise<void> {
    try {
      await axios.patch(
        `${this.baseURL}/${providerId}/vehicles/${vehicleId}/`,
        { status },
        this.getAuthHeaders()
      );
    } catch (error: any) {
      console.error('Failed to toggle vehicle status:', error);
      throw error;
    }
  }

  /**
   * Get provider availability
   */
  async getProviderAvailability(): Promise<ProviderAvailability[]> {
    try {
      const response = await axios.get<ApiResponse<ProviderAvailability[]>>(
        `${this.baseURL}/availability/`,
        this.getAuthHeaders()
      );
      return response.data.data || [];
    } catch (error: any) {
      console.error('Failed to fetch provider availability:', error);
      return [];
    }
  }

  /**
   * Get pending verification providers
   */
  async getPendingVerifications(): Promise<AmbulanceProvider[]> {
    try {
      const response = await axios.get<ApiResponse<AmbulanceProvider[]>>(
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
   * Get provider documents
   */
  async getProviderDocuments(providerId: string): Promise<AmbulanceDocument[]> {
    try {
      const response = await axios.get<ApiResponse<AmbulanceDocument[]>>(
        `${this.baseURL}/${providerId}/documents/`,
        this.getAuthHeaders()
      );
      return response.data.data || [];
    } catch (error: any) {
      console.error('Failed to fetch provider documents:', error);
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
}

export const ambulanceService = new AmbulanceServiceClass();
