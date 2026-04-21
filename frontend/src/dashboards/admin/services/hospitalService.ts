/**
 * Hospital Service
 * Handles all hospital-related API calls
 */
import axios from 'axios';
import { authService } from './authService';
import {
  Hospital,
  HospitalListParams,
  HospitalVacancy,
  HospitalApplication,
  HospitalSubscription,
  HospitalDocument,
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

class HospitalServiceClass {
  private readonly baseURL = `${API_BASE_URL}/admin/hospitals`;

  private getAuthHeaders() {
    const token = authService.getAccessToken();
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  }

  /**
   * Get list of all hospitals with pagination and filters
   */
  async getHospitals(params: HospitalListParams = {}): Promise<PaginatedResponse<Hospital>> {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.page_size) queryParams.append('page_size', params.page_size.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.facility_type) queryParams.append('facility_type', params.facility_type);
      if (params.verification_status) queryParams.append('verification_status', params.verification_status);

      const response = await axios.get<PaginatedResponse<Hospital>>(
        `${this.baseURL}/?${queryParams.toString()}`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch hospitals:', error);
      throw error;
    }
  }

  /**
   * Get hospital details by ID
   */
  async getHospitalById(hospitalId: string): Promise<Hospital> {
    try {
      const response = await axios.get<ApiResponse<Hospital>>(
        `${this.baseURL}/${hospitalId}/`,
        this.getAuthHeaders()
      );
      return response.data.data!;
    } catch (error: any) {
      console.error('Failed to fetch hospital details:', error);
      throw error;
    }
  }

  /**
   * Update hospital details
   */
  async updateHospital(hospitalId: string, data: Partial<Hospital>): Promise<void> {
    try {
      await axios.put(
        `${this.baseURL}/${hospitalId}/update/`,
        data,
        this.getAuthHeaders()
      );
    } catch (error: any) {
      console.error('Failed to update hospital:', error);
      throw error;
    }
  }

  /**
   * Delete hospital
   */
  async deleteHospital(hospitalId: string): Promise<void> {
    try {
      await axios.delete(
        `${this.baseURL}/${hospitalId}/delete/`,
        this.getAuthHeaders()
      );
    } catch (error: any) {
      console.error('Failed to delete hospital:', error);
      throw error;
    }
  }

  /**
   * Get hospital vacancies
   */
  async getHospitalVacancies(hospitalId: string, params: { status?: string } = {}): Promise<HospitalVacancy[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append('status', params.status);

      const response = await axios.get<ApiResponse<HospitalVacancy[]>>(
        `${this.baseURL}/${hospitalId}/vacancies/?${queryParams.toString()}`,
        this.getAuthHeaders()
      );
      return response.data.data || [];
    } catch (error: any) {
      console.error('Failed to fetch hospital vacancies:', error);
      return [];
    }
  }

  /**
   * Toggle vacancy status
   */
  async toggleVacancyStatus(hospitalId: string, vacancyId: string, status: string): Promise<void> {
    try {
      await axios.patch(
        `${this.baseURL}/${hospitalId}/vacancies/${vacancyId}/`,
        { status },
        this.getAuthHeaders()
      );
    } catch (error: any) {
      console.error('Failed to toggle vacancy status:', error);
      throw error;
    }
  }

  /**
   * Get hospital applications
   */
  async getHospitalApplications(hospitalId: string, params: { vacancy_id?: string; status?: string } = {}): Promise<HospitalApplication[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params.vacancy_id) queryParams.append('vacancy_id', params.vacancy_id);
      if (params.status) queryParams.append('status', params.status);

      const response = await axios.get<ApiResponse<HospitalApplication[]>>(
        `${this.baseURL}/${hospitalId}/applications/?${queryParams.toString()}`,
        this.getAuthHeaders()
      );
      return response.data.data || [];
    } catch (error: any) {
      console.error('Failed to fetch hospital applications:', error);
      return [];
    }
  }

  /**
   * Get hospital subscription
   */
  async getHospitalSubscription(hospitalId: string): Promise<HospitalSubscription | null> {
    try {
      const response = await axios.get<ApiResponse<HospitalSubscription>>(
        `${this.baseURL}/${hospitalId}/subscription/`,
        this.getAuthHeaders()
      );
      return response.data.data || null;
    } catch (error: any) {
      console.error('Failed to fetch hospital subscription:', error);
      return null;
    }
  }

  /**
   * Update hospital subscription
   */
  async updateHospitalSubscription(hospitalId: string, data: { plan_type: string; billing_cycle: string }): Promise<void> {
    try {
      await axios.put(
        `${this.baseURL}/${hospitalId}/subscription/update/`,
        data,
        this.getAuthHeaders()
      );
    } catch (error: any) {
      console.error('Failed to update hospital subscription:', error);
      throw error;
    }
  }

  /**
   * Get pending verification hospitals
   */
  async getPendingVerifications(): Promise<Hospital[]> {
    try {
      const response = await axios.get<ApiResponse<Hospital[]>>(
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
   * Get hospital documents
   */
  async getHospitalDocuments(hospitalId: string): Promise<HospitalDocument[]> {
    try {
      const response = await axios.get<ApiResponse<HospitalDocument[]>>(
        `${this.baseURL}/${hospitalId}/documents/`,
        this.getAuthHeaders()
      );
      return response.data.data || [];
    } catch (error: any) {
      console.error('Failed to fetch hospital documents:', error);
      return [];
    }
  }

  /**
   * Verify hospital
   */
  async verifyHospital(hospitalId: string): Promise<void> {
    try {
      await axios.post(
        `${this.baseURL}/${hospitalId}/verify/`,
        {},
        this.getAuthHeaders()
      );
    } catch (error: any) {
      console.error('Failed to verify hospital:', error);
      throw error;
    }
  }

  /**
   * Reject hospital verification
   */
  async rejectHospital(hospitalId: string, reason: string): Promise<void> {
    try {
      await axios.post(
        `${this.baseURL}/${hospitalId}/reject/`,
        { reason },
        this.getAuthHeaders()
      );
    } catch (error: any) {
      console.error('Failed to reject hospital:', error);
      throw error;
    }
  }
}

export const hospitalService = new HospitalServiceClass();
