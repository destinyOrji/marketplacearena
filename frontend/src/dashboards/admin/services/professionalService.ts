/**
 * Professional Service
 * Handles all professional-related API calls
 */
import axios from 'axios';
import { authService } from './authService';
import {
  Professional,
  ProfessionalListParams,
  ProfessionalService,
  ProfessionalApplication,
  ProfessionalSchedule,
  ProfessionalEarning,
  ProfessionalDocument,
  VerificationAction,
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

class ProfessionalServiceClass {
  private readonly baseURL = `${API_BASE_URL}/admin/professionals`;

  private getAuthHeaders() {
    const token = authService.getAccessToken();
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  }

  /**
   * Get list of all professionals with pagination and filters
   */
  async getProfessionals(params: ProfessionalListParams = {}): Promise<PaginatedResponse<Professional>> {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.page_size) queryParams.append('page_size', params.page_size.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.professional_type) queryParams.append('professional_type', params.professional_type);
      if (params.verification_status) queryParams.append('verification_status', params.verification_status);

      const response = await axios.get<PaginatedResponse<Professional>>(
        `${this.baseURL}/?${queryParams.toString()}`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch professionals:', error);
      throw error;
    }
  }

  /**
   * Get professional details by ID
   */
  async getProfessionalById(professionalId: string): Promise<Professional> {
    try {
      console.log('=== Fetching Professional ===');
      console.log('Professional ID:', professionalId);
      console.log('URL:', `${this.baseURL}/${professionalId}`);
      
      const response = await axios.get<ApiResponse<Professional>>(
        `${this.baseURL}/${professionalId}`,
        this.getAuthHeaders()
      );
      return response.data.data!;
    } catch (error: any) {
      console.error('Failed to fetch professional details:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }

  /**
   * Update professional details
   */
  async updateProfessional(professionalId: string, data: Partial<Professional>): Promise<void> {
    try {
      await axios.put(
        `${this.baseURL}/${professionalId}/update/`,
        data,
        this.getAuthHeaders()
      );
    } catch (error: any) {
      console.error('Failed to update professional:', error);
      throw error;
    }
  }

  /**
   * Delete professional
   */
  async deleteProfessional(professionalId: string): Promise<void> {
    try {
      await axios.delete(
        `${this.baseURL}/${professionalId}/delete/`,
        this.getAuthHeaders()
      );
    } catch (error: any) {
      console.error('Failed to delete professional:', error);
      throw error;
    }
  }

  /**
   * Get professional services
   */
  async getProfessionalServices(professionalId: string): Promise<ProfessionalService[]> {
    try {
      const response = await axios.get<ApiResponse<ProfessionalService[]>>(
        `${this.baseURL}/${professionalId}/services/`,
        this.getAuthHeaders()
      );
      return response.data.data || [];
    } catch (error: any) {
      console.error('Failed to fetch professional services:', error);
      return [];
    }
  }

  /**
   * Toggle service active status
   */
  async toggleServiceStatus(professionalId: string, serviceId: string, isActive: boolean): Promise<void> {
    try {
      await axios.patch(
        `${this.baseURL}/${professionalId}/services/${serviceId}/`,
        { is_active: isActive },
        this.getAuthHeaders()
      );
    } catch (error: any) {
      console.error('Failed to toggle service status:', error);
      throw error;
    }
  }

  /**
   * Get professional applications
   */
  async getProfessionalApplications(professionalId: string, params: { status?: string; start_date?: string; end_date?: string } = {}): Promise<ProfessionalApplication[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append('status', params.status);
      if (params.start_date) queryParams.append('start_date', params.start_date);
      if (params.end_date) queryParams.append('end_date', params.end_date);

      const response = await axios.get<ApiResponse<ProfessionalApplication[]>>(
        `${this.baseURL}/${professionalId}/applications/?${queryParams.toString()}`,
        this.getAuthHeaders()
      );
      return response.data.data || [];
    } catch (error: any) {
      console.error('Failed to fetch professional applications:', error);
      return [];
    }
  }

  /**
   * Get professional schedules
   */
  async getProfessionalSchedules(professionalId: string, params: { start_date?: string; end_date?: string } = {}): Promise<ProfessionalSchedule[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params.start_date) queryParams.append('start_date', params.start_date);
      if (params.end_date) queryParams.append('end_date', params.end_date);

      const response = await axios.get<ApiResponse<ProfessionalSchedule[]>>(
        `${this.baseURL}/${professionalId}/schedules/?${queryParams.toString()}`,
        this.getAuthHeaders()
      );
      return response.data.data || [];
    } catch (error: any) {
      console.error('Failed to fetch professional schedules:', error);
      return [];
    }
  }

  /**
   * Get professional earnings
   */
  async getProfessionalEarnings(professionalId: string, params: { start_date?: string; end_date?: string } = {}): Promise<ProfessionalEarning[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params.start_date) queryParams.append('start_date', params.start_date);
      if (params.end_date) queryParams.append('end_date', params.end_date);

      const response = await axios.get<ApiResponse<ProfessionalEarning[]>>(
        `${this.baseURL}/${professionalId}/earnings/?${queryParams.toString()}`,
        this.getAuthHeaders()
      );
      return response.data.data || [];
    } catch (error: any) {
      console.error('Failed to fetch professional earnings:', error);
      return [];
    }
  }

  /**
   * Get pending verification documents
   */
  async getPendingVerifications(): Promise<Professional[]> {
    try {
      const response = await axios.get<ApiResponse<Professional[]>>(
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
   * Get professional documents
   */
  async getProfessionalDocuments(professionalId: string): Promise<ProfessionalDocument[]> {
    try {
      const response = await axios.get<ApiResponse<ProfessionalDocument[]>>(
        `${this.baseURL}/${professionalId}/documents/`,
        this.getAuthHeaders()
      );
      return response.data.data || [];
    } catch (error: any) {
      console.error('Failed to fetch professional documents:', error);
      return [];
    }
  }

  /**
   * Verify professional
   */
  async verifyProfessional(professionalId: string): Promise<void> {
    try {
      await axios.post(
        `${this.baseURL}/${professionalId}/verify/`,
        {},
        this.getAuthHeaders()
      );
    } catch (error: any) {
      console.error('Failed to verify professional:', error);
      throw error;
    }
  }

  /**
   * Reject professional verification
   */
  async rejectProfessional(professionalId: string, reason: string): Promise<void> {
    try {
      await axios.post(
        `${this.baseURL}/${professionalId}/reject/`,
        { reason },
        this.getAuthHeaders()
      );
    } catch (error: any) {
      console.error('Failed to reject professional:', error);
      throw error;
    }
  }
}

export const professionalService = new ProfessionalServiceClass();
