import axios from 'axios';
import { authService } from './authService';
import { ApiResponse, PaginationMeta } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://healthmarketarena.com/api';

export interface GymPhysioProvider {
  id: string;
  _id?: string;
  businessName: string;
  businessType: string;
  email?: string;
  phone: string;
  licenseNumber: string;
  specialization: string;
  yearsInBusiness: number;
  address: string;
  city: string;
  state: string;
  country: string;
  isVerified: boolean;
  isAvailable: boolean;
  averageRating: number;
  totalReviews: number;
  totalBookings: number;
  completedBookings: number;
  bio?: string;
  profilePicture?: string;
  user?: { firstName: string; lastName: string; email: string; status: string };
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
  statuscode: number; status: string; message: string;
  data: T[]; pagination: PaginationMeta;
}

class GymPhysioServiceClass {
  private readonly baseURL = `${API_BASE_URL}/admin/gym-physio`;
  private h() { return { headers: { Authorization: `Bearer ${authService.getAccessToken()}` } }; }

  async getProviders(params: GymPhysioListParams = {}): Promise<PaginatedResponse<GymPhysioProvider>> {
    const q = new URLSearchParams();
    if (params.page) q.append('page', String(params.page));
    if (params.page_size) q.append('page_size', String(params.page_size));
    if (params.search) q.append('search', params.search);
    if (params.business_type) q.append('business_type', params.business_type);
    if (params.verification_status) q.append('verification_status', params.verification_status);
    if (params.city) q.append('city', params.city);
    if (params.state) q.append('state', params.state);
    const res = await axios.get<PaginatedResponse<GymPhysioProvider>>(`${this.baseURL}?${q}`, this.h());
    return res.data;
  }

  async getProviderById(id: string): Promise<GymPhysioProvider> {
    const res = await axios.get<ApiResponse<GymPhysioProvider>>(`${this.baseURL}/${id}`, this.h());
    return res.data.data!;
  }

  async updateProvider(id: string, data: Partial<GymPhysioProvider>): Promise<void> {
    await axios.put(`${this.baseURL}/${id}/update`, data, this.h());
  }

  async deleteProvider(id: string): Promise<void> {
    await axios.delete(`${this.baseURL}/${id}/delete`, this.h());
  }

  async getPendingVerifications(): Promise<GymPhysioProvider[]> {
    try {
      const res = await axios.get<ApiResponse<GymPhysioProvider[]>>(`${this.baseURL}/verification/pending`, this.h());
      return res.data.data || [];
    } catch { return []; }
  }

  async verifyProvider(id: string): Promise<void> {
    await axios.post(`${this.baseURL}/${id}/verify`, {}, this.h());
  }

  async rejectProvider(id: string, reason: string): Promise<void> {
    await axios.post(`${this.baseURL}/${id}/reject`, { reason }, this.h());
  }

  async toggleProviderStatus(id: string, isActive: boolean): Promise<void> {
    await axios.patch(`${this.baseURL}/${id}/status`, { isActive }, this.h());
  }
}

export const gymPhysioService = new GymPhysioServiceClass();
