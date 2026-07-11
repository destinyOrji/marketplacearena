/**
 * Settings Service
 * Handles all settings-related API calls
 */
import axios from 'axios';
import { authService } from './authService';
import {
  SystemSettings,
  EmailTemplate,
  PaymentSettings,
  AdminUser,
  Role,
  AuditLog,
  AuditLogFilters,
  ApiResponse,
  PaginationMeta,
  AvailablePermission
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';

interface PaginatedResponse<T> {
  statuscode: number;
  status: string;
  message: string;
  data: T[];
  pagination: PaginationMeta;
}

class SettingsServiceClass {
  private readonly baseURL = `${API_BASE_URL}/admin/settings`;

  private getAuthHeaders() {
    const token = authService.getAccessToken();
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  }

  // System Settings
  async getSystemSettings(): Promise<SystemSettings> {
    const response = await axios.get<ApiResponse<SystemSettings>>(
      `${this.baseURL}/system`,
      this.getAuthHeaders()
    );
    return response.data.data!;
  }

  async updateSystemSettings(settings: Partial<SystemSettings>): Promise<void> {
    await axios.put(`${this.baseURL}/system`, settings, this.getAuthHeaders());
  }

  // Email Templates
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    try {
      const response = await axios.get<ApiResponse<EmailTemplate[]>>(
        `${this.baseURL}/email-templates`,
        this.getAuthHeaders()
      );
      return response.data.data || [];
    } catch {
      return [];
    }
  }

  async updateEmailTemplate(templateId: number, data: Partial<EmailTemplate>): Promise<void> {
    await axios.put(`${this.baseURL}/email-templates/${templateId}`, data, this.getAuthHeaders());
  }

  async testEmailTemplate(templateId: number, recipientEmail: string): Promise<void> {
    await axios.post(
      `${this.baseURL}/email-templates/${templateId}/test`,
      { recipient_email: recipientEmail },
      this.getAuthHeaders()
    );
  }

  // Payment Settings
  async getPaymentSettings(): Promise<PaymentSettings> {
    const response = await axios.get<ApiResponse<PaymentSettings>>(
      `${this.baseURL}/payment`,
      this.getAuthHeaders()
    );
    return response.data.data!;
  }

  async updatePaymentSettings(settings: Partial<PaymentSettings>): Promise<void> {
    await axios.put(`${this.baseURL}/payment`, settings, this.getAuthHeaders());
  }

  // Admin Users
  async getAdminUsers(): Promise<AdminUser[]> {
    try {
      const response = await axios.get<ApiResponse<AdminUser[]>>(
        `${this.baseURL}/admins`,
        this.getAuthHeaders()
      );
      return response.data.data || [];
    } catch (error: any) {
      console.error('Failed to fetch admin users:', error);
      return [];
    }
  }

  async createAdminUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    permissions?: Record<string, boolean>;
  }): Promise<AdminUser> {
    const response = await axios.post<ApiResponse<AdminUser>>(
      `${this.baseURL}/admins`,
      data,
      this.getAuthHeaders()
    );
    return response.data.data!;
  }

  async updateAdminUser(adminId: string, data: {
    role?: string;
    is_active?: boolean;
    firstName?: string;
    lastName?: string;
    permissions?: Record<string, boolean>;
  }): Promise<AdminUser> {
    const response = await axios.put<ApiResponse<AdminUser>>(
      `${this.baseURL}/admins/${adminId}`,
      data,
      this.getAuthHeaders()
    );
    return response.data.data!;
  }

  async deleteAdminUser(adminId: string): Promise<void> {
    await axios.delete(`${this.baseURL}/admins/${adminId}`, this.getAuthHeaders());
  }

  async getAdminPermissions(adminId: string): Promise<Record<string, boolean>> {
    const response = await axios.get<ApiResponse<Record<string, boolean>>>(
      `${this.baseURL}/admins/${adminId}/permissions`,
      this.getAuthHeaders()
    );
    return response.data.data || {};
  }

  async updateAdminPermissions(adminId: string, permissions: Record<string, boolean>): Promise<void> {
    await axios.put(
      `${this.baseURL}/admins/${adminId}/permissions`,
      { permissions },
      this.getAuthHeaders()
    );
  }

  // Roles & Permissions
  async getRoles(): Promise<Role[]> {
    try {
      const response = await axios.get<ApiResponse<Role[]>>(
        `${this.baseURL}/roles`,
        this.getAuthHeaders()
      );
      return response.data.data || [];
    } catch {
      return [];
    }
  }

  async getAvailablePermissions(): Promise<AvailablePermission[]> {
    try {
      const response = await axios.get<ApiResponse<AvailablePermission[]>>(
        `${this.baseURL}/permissions`,
        this.getAuthHeaders()
      );
      return response.data.data || [];
    } catch {
      return [];
    }
  }

  // Audit Logs
  async getAuditLogs(filters: AuditLogFilters = {}): Promise<PaginatedResponse<AuditLog>> {
    try {
      const queryParams = new URLSearchParams();
      if (filters.admin_id) queryParams.append('admin_id', filters.admin_id.toString());
      if (filters.action) queryParams.append('action', filters.action);
      if (filters.start_date) queryParams.append('start_date', filters.start_date);
      if (filters.end_date) queryParams.append('end_date', filters.end_date);
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.page_size) queryParams.append('page_size', filters.page_size.toString());

      const response = await axios.get<PaginatedResponse<AuditLog>>(
        `${this.baseURL}/audit-logs?${queryParams.toString()}`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async exportAuditLogs(filters: AuditLogFilters = {}): Promise<Blob> {
    const queryParams = new URLSearchParams();
    if (filters.admin_id) queryParams.append('admin_id', filters.admin_id.toString());
    if (filters.action) queryParams.append('action', filters.action);
    if (filters.start_date) queryParams.append('start_date', filters.start_date);
    if (filters.end_date) queryParams.append('end_date', filters.end_date);

    const response = await axios.get(
      `${this.baseURL}/audit-logs/export?${queryParams.toString()}`,
      { ...this.getAuthHeaders(), responseType: 'blob' }
    );
    return response.data;
  }
}

export const settingsService = new SettingsServiceClass();
