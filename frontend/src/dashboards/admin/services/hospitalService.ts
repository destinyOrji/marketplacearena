import axios from 'axios';
import { authService } from './authService';
import {
  Hospital, HospitalListParams, HospitalVacancy, HospitalApplication,
  HospitalSubscription, HospitalDocument, ApiResponse, PaginationMeta
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://healthmarketarena.com/api';

interface PaginatedResponse<T> {
  statuscode: number; status: string; message: string;
  data: T[]; pagination: PaginationMeta;
}

class HospitalServiceClass {
  private readonly baseURL = `${API_BASE_URL}/admin/hospitals`;
  private h() { return { headers: { Authorization: `Bearer ${authService.getAccessToken()}` } }; }

  async getHospitals(params: HospitalListParams = {}): Promise<PaginatedResponse<Hospital>> {
    const q = new URLSearchParams();
    if (params.page) q.append('page', String(params.page));
    if (params.page_size) q.append('page_size', String(params.page_size));
    if (params.search) q.append('search', params.search);
    if (params.facility_type) q.append('facility_type', params.facility_type);
    if (params.verification_status) q.append('verification_status', params.verification_status);
    const res = await axios.get<PaginatedResponse<Hospital>>(`${this.baseURL}?${q}`, this.h());
    return res.data;
  }

  async getHospitalById(id: string): Promise<Hospital> {
    const res = await axios.get<ApiResponse<Hospital>>(`${this.baseURL}/${id}`, this.h());
    return res.data.data!;
  }

  async updateHospital(id: string, data: Partial<Hospital>): Promise<void> {
    await axios.put(`${this.baseURL}/${id}/update`, data, this.h());
  }

  async deleteHospital(id: string): Promise<void> {
    await axios.delete(`${this.baseURL}/${id}/delete`, this.h());
  }

  async getHospitalVacancies(id: string, params: { status?: string } = {}): Promise<HospitalVacancy[]> {
    try {
      const q = new URLSearchParams();
      if (params.status) q.append('status', params.status);
      const res = await axios.get<ApiResponse<HospitalVacancy[]>>(`${this.baseURL}/${id}/vacancies?${q}`, this.h());
      return res.data.data || [];
    } catch { return []; }
  }

  async toggleVacancyStatus(hospitalId: string, vacancyId: string, isActive: boolean): Promise<void> {
    await axios.patch(`${this.baseURL}/${hospitalId}/vacancies/${vacancyId}`, { is_active: isActive }, this.h());
  }

  async getHospitalApplications(id: string, params: { vacancy_id?: string; status?: string } = {}): Promise<HospitalApplication[]> {
    try {
      const q = new URLSearchParams();
      if (params.vacancy_id) q.append('vacancy_id', params.vacancy_id);
      if (params.status) q.append('status', params.status);
      const res = await axios.get<ApiResponse<HospitalApplication[]>>(`${this.baseURL}/${id}/applications?${q}`, this.h());
      return res.data.data || [];
    } catch { return []; }
  }

  async getHospitalSubscription(id: string): Promise<HospitalSubscription | null> {
    try {
      const res = await axios.get<ApiResponse<HospitalSubscription>>(`${this.baseURL}/${id}/subscription`, this.h());
      return res.data.data || null;
    } catch { return null; }
  }

  async updateHospitalSubscription(id: string, data: { plan_type: string; billing_cycle: string }): Promise<void> {
    await axios.put(`${this.baseURL}/${id}/subscription/update`, data, this.h());
  }

  async getHospitalDocuments(id: string): Promise<HospitalDocument[]> {
    try {
      const res = await axios.get<ApiResponse<HospitalDocument[]>>(`${this.baseURL}/${id}/documents`, this.h());
      return res.data.data || [];
    } catch { return []; }
  }

  async getPendingVerifications(): Promise<Hospital[]> {
    try {
      const res = await axios.get<ApiResponse<Hospital[]>>(`${this.baseURL}/verification/pending`, this.h());
      return res.data.data || [];
    } catch { return []; }
  }

  async verifyHospital(id: string): Promise<void> {
    await axios.post(`${this.baseURL}/${id}/verify`, {}, this.h());
  }

  async rejectHospital(id: string, reason: string): Promise<void> {
    await axios.post(`${this.baseURL}/${id}/reject`, { reason }, this.h());
  }
}

export const hospitalService = new HospitalServiceClass();
