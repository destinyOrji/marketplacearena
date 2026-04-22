/**
 * Patient Service
 * Handles all patient-related API calls
 */
import axios from 'axios';
import { authService } from './authService';
import {
  Patient,
  PatientListParams,
  PatientAppointment,
  PatientMedicalRecord,
  PatientEmergencyBooking,
  ApiResponse,
  PaginationMeta
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://healthmarketarena.com/api';

interface PaginatedResponse<T> {
  statuscode: number;
  status: string;
  message: string;
  data: T[];
  pagination: PaginationMeta;
}

class PatientService {
  private readonly baseURL = `${API_BASE_URL}/admin/patients`;

  private getAuthHeaders() {
    const token = authService.getAccessToken();
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  }

  /**
   * Get list of all patients with pagination and filters
   */
  async getPatients(params: PatientListParams = {}): Promise<PaginatedResponse<Patient>> {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.page_size) queryParams.append('page_size', params.page_size.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);

      const response = await axios.get<PaginatedResponse<Patient>>(
        `${this.baseURL}?${queryParams.toString()}`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch patients:', error);
      throw error;
    }
  }

  /**
   * Get patient details by ID
   */
  async getPatientById(patientId: string): Promise<Patient> {
    try {
      const response = await axios.get<ApiResponse<Patient>>(
        `${this.baseURL}/${patientId}`,
        this.getAuthHeaders()
      );
      return response.data.data!;
    } catch (error: any) {
      console.error('Failed to fetch patient details:', error);
      throw error;
    }
  }

  /**
   * Update patient details
   */
  async updatePatient(patientId: string, data: Partial<Patient>): Promise<void> {
    try {
      await axios.put(
        `${this.baseURL}/${patientId}/update`,
        data,
        this.getAuthHeaders()
      );
    } catch (error: any) {
      console.error('Failed to update patient:', error);
      throw error;
    }
  }

  /**
   * Delete patient
   */
  async deletePatient(patientId: string): Promise<void> {
    try {
      await axios.delete(
        `${this.baseURL}/${patientId}/delete`,
        this.getAuthHeaders()
      );
    } catch (error: any) {
      console.error('Failed to delete patient:', error);
      throw error;
    }
  }

  /**
   * Get patient appointments
   */
  async getPatientAppointments(patientId: string, params: { status?: string; start_date?: string; end_date?: string } = {}): Promise<PatientAppointment[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append('status', params.status);
      if (params.start_date) queryParams.append('start_date', params.start_date);
      if (params.end_date) queryParams.append('end_date', params.end_date);

      const response = await axios.get<ApiResponse<PatientAppointment[]>>(
        `${this.baseURL}/${patientId}/appointments?${queryParams.toString()}`,
        this.getAuthHeaders()
      );
      return response.data.data || [];
    } catch (error: any) {
      console.error('Failed to fetch patient appointments:', error);
      return [];
    }
  }

  /**
   * Get patient medical records
   */
  async getPatientMedicalRecords(patientId: string): Promise<PatientMedicalRecord[]> {
    try {
      const response = await axios.get<ApiResponse<PatientMedicalRecord[]>>(
        `${this.baseURL}/${patientId}/records`,
        this.getAuthHeaders()
      );
      return response.data.data || [];
    } catch (error: any) {
      console.error('Failed to fetch patient medical records:', error);
      return [];
    }
  }

  /**
   * Get patient emergency bookings
   */
  async getPatientEmergencyBookings(patientId: string): Promise<PatientEmergencyBooking[]> {
    try {
      const response = await axios.get<ApiResponse<PatientEmergencyBooking[]>>(
        `${this.baseURL}/${patientId}/emergencies`,
        this.getAuthHeaders()
      );
      return response.data.data || [];
    } catch (error: any) {
      console.error('Failed to fetch patient emergency bookings:', error);
      return [];
    }
  }
}

export const patientService = new PatientService();
