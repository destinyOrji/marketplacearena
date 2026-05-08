import axios from 'axios';
import { authService } from './authService';
import {
  AmbulanceProvider, AmbulanceProviderListParams, EmergencyBooking,
  Vehicle, ProviderAvailability, AmbulanceDocument, ApiResponse, PaginationMeta
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://healthmarketarena.com/api';

interface PaginatedResponse<T> {
  statuscode: number; status: string; message: string;
  data: T[]; pagination: PaginationMeta;
}

class AmbulanceServiceClass {
  private readonly baseURL = `${API_BASE_URL}/admin/ambulances`;
  private h() { return { headers: { Authorization: `Bearer ${authService.getAccessToken()}` } }; }

  async getProviders(params: AmbulanceProviderListParams = {}): Promise<PaginatedResponse<AmbulanceProvider>> {
    const q = new URLSearchParams();
    if (params.page) q.append('page', String(params.page));
    if (params.page_size) q.append('page_size', String(params.page_size));
    if (params.search) q.append('search', params.search);
    if (params.service_type) q.append('service_type', params.service_type);
    if (params.verification_status) q.append('verification_status', params.verification_status);
    const res = await axios.get<PaginatedResponse<AmbulanceProvider>>(`${this.baseURL}?${q}`, this.h());
    return res.data;
  }

  async getProviderById(id: string): Promise<AmbulanceProvider> {
    const res = await axios.get<ApiResponse<AmbulanceProvider>>(`${this.baseURL}/${id}`, this.h());
    return res.data.data!;
  }

  async updateProvider(id: string, data: Partial<AmbulanceProvider>): Promise<void> {
    await axios.put(`${this.baseURL}/${id}/update`, data, this.h());
  }

  async deleteProvider(id: string): Promise<void> {
    await axios.delete(`${this.baseURL}/${id}/delete`, this.h());
  }

  async getEmergencyBookings(params: { provider_id?: string; status?: string; start_date?: string; end_date?: string } = {}): Promise<any> {
    try {
      const q = new URLSearchParams();
      if (params.provider_id) q.append('provider_id', params.provider_id);
      if (params.status) q.append('status', params.status);
      if (params.start_date) q.append('start_date', params.start_date);
      if (params.end_date) q.append('end_date', params.end_date);
      const res = await axios.get<ApiResponse<EmergencyBooking[]>>(`${this.baseURL}/bookings?${q}`, this.h());
      return res.data.data || [];
    } catch { return []; }
  }

  async getProviderVehicles(id: string): Promise<Vehicle[]> {
    try {
      const res = await axios.get<ApiResponse<Vehicle[]>>(`${this.baseURL}/${id}/vehicles`, this.h());
      return res.data.data || [];
    } catch { return []; }
  }

  async toggleVehicleStatus(providerId: string, vehicleId: string, isActive: boolean): Promise<void> {
    await axios.patch(`${this.baseURL}/${providerId}/vehicles/${vehicleId}`, { is_active: isActive }, this.h());
  }

  async getProviderAvailability(): Promise<any[]> {
    try {
      const res = await axios.get<ApiResponse<ProviderAvailability[]>>(`${this.baseURL}/availability`, this.h());
      return res.data.data || [];
    } catch { return []; }
  }

  async getPendingVerifications(): Promise<AmbulanceProvider[]> {
    try {
      const res = await axios.get<ApiResponse<AmbulanceProvider[]>>(`${this.baseURL}/verification/pending`, this.h());
      return res.data.data || [];
    } catch { return []; }
  }

  async getProviderDocuments(id: string): Promise<AmbulanceDocument[]> {
    try {
      const res = await axios.get<ApiResponse<AmbulanceDocument[]>>(`${this.baseURL}/${id}/documents`, this.h());
      return res.data.data || [];
    } catch { return []; }
  }

  async verifyProvider(id: string): Promise<void> {
    await axios.post(`${this.baseURL}/${id}/verify`, {}, this.h());
  }

  async rejectProvider(id: string, reason: string): Promise<void> {
    await axios.post(`${this.baseURL}/${id}/reject`, { reason }, this.h());
  }
}

export const ambulanceService = new AmbulanceServiceClass();
