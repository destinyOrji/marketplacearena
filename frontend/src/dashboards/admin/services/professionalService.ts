import axios from 'axios';
import { authService } from './authService';
import {
  Professional, ProfessionalListParams, ProfessionalService,
  ProfessionalApplication, ProfessionalSchedule, ProfessionalEarning,
  ProfessionalDocument, ApiResponse, PaginationMeta
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';

interface PaginatedResponse<T> {
  statuscode: number; status: string; message: string;
  data: T[]; pagination: PaginationMeta;
}

class ProfessionalServiceClass {
  private readonly baseURL = `${API_BASE_URL}/admin/professionals`;
  private h() { return { headers: { Authorization: `Bearer ${authService.getAccessToken()}` } }; }

  async getProfessionals(params: ProfessionalListParams = {}): Promise<PaginatedResponse<Professional>> {
    const q = new URLSearchParams();
    if (params.page) q.append('page', String(params.page));
    if (params.page_size) q.append('page_size', String(params.page_size));
    if (params.search) q.append('search', params.search);
    if (params.professional_type) q.append('professional_type', params.professional_type);
    if (params.verification_status) q.append('verification_status', params.verification_status);
    const res = await axios.get<PaginatedResponse<Professional>>(`${this.baseURL}?${q}`, this.h());
    return res.data;
  }

  async getProfessionalById(id: string): Promise<Professional> {
    const res = await axios.get<ApiResponse<Professional>>(`${this.baseURL}/${id}`, this.h());
    return res.data.data!;
  }

  async updateProfessional(id: string, data: Partial<Professional>): Promise<void> {
    await axios.put(`${this.baseURL}/${id}/update`, data, this.h());
  }

  async deleteProfessional(id: string): Promise<void> {
    await axios.delete(`${this.baseURL}/${id}/delete`, this.h());
  }

  async getProfessionalServices(id: string): Promise<ProfessionalService[]> {
    try {
      const res = await axios.get<ApiResponse<ProfessionalService[]>>(`${this.baseURL}/${id}/services`, this.h());
      return res.data.data || [];
    } catch { return []; }
  }

  async toggleServiceStatus(id: string, serviceId: string, isActive: boolean): Promise<void> {
    await axios.patch(`${this.baseURL}/${id}/services/${serviceId}`, { is_active: isActive }, this.h());
  }

  async getProfessionalApplications(id: string, params: { status?: string; start_date?: string; end_date?: string } = {}): Promise<ProfessionalApplication[]> {
    try {
      const q = new URLSearchParams();
      if (params.status) q.append('status', params.status);
      if (params.start_date) q.append('start_date', params.start_date);
      if (params.end_date) q.append('end_date', params.end_date);
      const res = await axios.get<ApiResponse<ProfessionalApplication[]>>(`${this.baseURL}/${id}/applications?${q}`, this.h());
      return res.data.data || [];
    } catch { return []; }
  }

  async getProfessionalSchedules(id: string, params: { start_date?: string; end_date?: string } = {}): Promise<ProfessionalSchedule[]> {
    try {
      const q = new URLSearchParams();
      if (params.start_date) q.append('start_date', params.start_date);
      if (params.end_date) q.append('end_date', params.end_date);
      const res = await axios.get<ApiResponse<ProfessionalSchedule[]>>(`${this.baseURL}/${id}/schedules?${q}`, this.h());
      return res.data.data || [];
    } catch { return []; }
  }

  async getProfessionalEarnings(id: string, params: { start_date?: string; end_date?: string } = {}): Promise<any> {
    try {
      const q = new URLSearchParams();
      if (params.start_date) q.append('start_date', params.start_date);
      if (params.end_date) q.append('end_date', params.end_date);
      const res = await axios.get<ApiResponse<any>>(`${this.baseURL}/${id}/earnings?${q}`, this.h());
      return res.data.data || { totalEarnings: 0, appointments: [] };
    } catch { return { totalEarnings: 0, appointments: [] }; }
  }

  async getProfessionalDocuments(id: string): Promise<ProfessionalDocument[]> {
    try {
      const res = await axios.get<ApiResponse<ProfessionalDocument[]>>(`${this.baseURL}/${id}/documents`, this.h());
      return res.data.data || [];
    } catch { return []; }
  }

  async getPendingVerifications(): Promise<Professional[]> {
    try {
      const res = await axios.get<ApiResponse<Professional[]>>(`${this.baseURL}/verification/pending`, this.h());
      return res.data.data || [];
    } catch { return []; }
  }

  async verifyProfessional(id: string): Promise<void> {
    await axios.post(`${this.baseURL}/${id}/verify`, {}, this.h());
  }

  async rejectProfessional(id: string, reason: string): Promise<void> {
    await axios.post(`${this.baseURL}/${id}/reject`, { reason }, this.h());
  }
}

export const professionalService = new ProfessionalServiceClass();
