/**
 * API service for Hospital Dashboard
 */
import axios, { AxiosInstance } from 'axios';
import type {
  Hospital,
  Vacancy,
  Application,
  ApplicationDetail,
  Payment,
  Subscription,
  DashboardStats,
  VacancyStats,
  ApiResponse,
  PaginationMeta,
  JobOffer
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';

class HospitalApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/hospitals`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('hospitalToken') || localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Hospital Profile
  async getProfile(): Promise<Hospital> {
    const response = await this.api.get<ApiResponse<Hospital>>('/profile');
    return response.data.data!;
  }

  async updateProfile(data: Partial<Hospital>): Promise<Hospital> {
    const response = await this.api.put<ApiResponse<Hospital>>('/profile/update', data);
    return response.data.data!;
  }

  async completeOnboarding(data: Partial<Hospital>): Promise<Hospital> {
    const response = await this.api.post<ApiResponse<Hospital>>('/onboarding', data);
    return response.data.data!;
  }

  async uploadImage(file: File, imageType: 'logo' | 'facility'): Promise<{ image_url: string }> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('image_type', imageType);

    const response = await this.api.post<ApiResponse<{ image_url: string }>>(
      '/upload-image/',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data!;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.api.get<ApiResponse<DashboardStats>>('/dashboard-stats/');
    return response.data.data!;
  }

  // Vacancies
  async listVacancies(params?: {
    status?: string;
    department?: string;
    search?: string;
    page?: number;
    page_size?: number;
  }): Promise<{ vacancies: Vacancy[]; pagination: PaginationMeta }> {
    const response = await this.api.get<ApiResponse<{ vacancies: Vacancy[]; pagination: PaginationMeta }>>(
      '/vacancies',
      { params }
    );
    return response.data.data!;
  }

  async getVacancy(vacancyId: number): Promise<Vacancy> {
    const response = await this.api.get<ApiResponse<Vacancy>>(`/vacancies/${vacancyId}/`);
    return response.data.data!;
  }

  async createVacancy(data: Partial<Vacancy>): Promise<Vacancy> {
    const response = await this.api.post<ApiResponse<Vacancy>>('/vacancies/create', data);
    return response.data.data!;
  }

  async updateVacancy(vacancyId: number, data: Partial<Vacancy>): Promise<Vacancy> {
    const response = await this.api.put<ApiResponse<Vacancy>>(
      `/vacancies/${vacancyId}/update/`,
      data
    );
    return response.data.data!;
  }

  async updateVacancyStatus(vacancyId: number, status: string): Promise<Vacancy> {
    const response = await this.api.patch<ApiResponse<Vacancy>>(
      `/vacancies/${vacancyId}/status/`,
      { status }
    );
    return response.data.data!;
  }

  async deleteVacancy(vacancyId: number): Promise<void> {
    await this.api.delete(`/vacancies/${vacancyId}/delete/`);
  }

  async getVacancyApplications(vacancyId: number, status?: string): Promise<{
    vacancy_id: number;
    job_title: string;
    applications: Application[];
    total_count: number;
  }> {
    const response = await this.api.get<ApiResponse<{
      vacancy_id: number;
      job_title: string;
      applications: Application[];
      total_count: number;
    }>>(`/vacancies/${vacancyId}/applications/`, {
      params: status ? { status } : undefined,
    });
    return response.data.data!;
  }

  async getVacancyStats(vacancyId: number): Promise<VacancyStats> {
    const response = await this.api.get<ApiResponse<VacancyStats>>(
      `/vacancies/${vacancyId}/stats/`
    );
    return response.data.data!;
  }

  // Applications
  async listApplications(params?: {
    status?: string;
    vacancy_id?: number;
    page?: number;
    page_size?: number;
  }): Promise<{ applications: Application[]; pagination: PaginationMeta }> {
    const response = await this.api.get<ApiResponse<{ applications: Application[]; pagination: PaginationMeta }>>(
      '/applications/',
      { params }
    );
    return response.data.data!;
  }

  async getApplication(applicationId: number): Promise<ApplicationDetail> {
    const response = await this.api.get<ApiResponse<ApplicationDetail>>(
      `/applications/${applicationId}/`
    );
    return response.data.data!;
  }

  async updateApplicationStatus(applicationId: number, status: string): Promise<ApplicationDetail> {
    const response = await this.api.patch<ApiResponse<ApplicationDetail>>(
      `/applications/${applicationId}/status/`,
      { status }
    );
    return response.data.data!;
  }

  async reviewApplication(
    applicationId: number,
    data: { application_status: string; review_notes?: string }
  ): Promise<ApplicationDetail> {
    const response = await this.api.post<ApiResponse<ApplicationDetail>>(
      `/applications/${applicationId}/review/`,
      data
    );
    return response.data.data!;
  }

  async sendJobOffer(applicationId: number, offerDetails: JobOffer): Promise<ApplicationDetail> {
    const response = await this.api.post<ApiResponse<ApplicationDetail>>(
      `/applications/${applicationId}/send-offer/`,
      offerDetails
    );
    return response.data.data!;
  }

  async getApplicationsStats(): Promise<Record<string, number>> {
    const response = await this.api.get<ApiResponse<Record<string, number>>>('/applications/stats/');
    return response.data.data!;
  }

  // Billing & Payments
  async getSubscription(): Promise<Subscription> {
    const response = await this.api.get<ApiResponse<Subscription>>('/billing/subscription/');
    return response.data.data!;
  }

  async subscribeToPlan(data: {
    plan_type: string;
    duration_months: number;
    auto_renew: boolean;
  }): Promise<{ subscription: Subscription; payment: Payment }> {
    const response = await this.api.post<ApiResponse<{ subscription: Subscription; payment: Payment }>>(
      '/billing/subscribe/',
      data
    );
    return response.data.data!;
  }

  async listPayments(params?: {
    status?: string;
    page?: number;
    page_size?: number;
  }): Promise<{ payments: Payment[]; pagination: PaginationMeta }> {
    const response = await this.api.get<ApiResponse<{ payments: Payment[]; pagination: PaginationMeta }>>(
      '/billing/payments/',
      { params }
    );
    return response.data.data!;
  }

  async getPayment(paymentId: number): Promise<Payment> {
    const response = await this.api.get<ApiResponse<Payment>>(`/billing/payments/${paymentId}/`);
    return response.data.data!;
  }

  async initiatePayment(data: {
    payment_type: string;
    amount: number;
    currency: string;
    payment_method: string;
    description?: string;
  }): Promise<Payment> {
    const response = await this.api.post<ApiResponse<Payment>>(
      '/billing/payments/initiate/',
      data
    );
    return response.data.data!;
  }

  async getUsageStats(): Promise<any> {
    const response = await this.api.get<ApiResponse<any>>('/billing/usage/');
    return response.data.data!;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.api.put('/profile/password', { currentPassword, newPassword });
  }
}

export const hospitalApi = new HospitalApiService();
