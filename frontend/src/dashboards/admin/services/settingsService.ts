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
    try {
      const response = await axios.get<ApiResponse<SystemSettings>>(
        `${this.baseURL}/system/`,
        this.getAuthHeaders()
      );
      return response.data.data!;
    } catch (error: any) {
      console.error('Failed to fetch system settings:', error);
      throw error;
    }
  }

  async updateSystemSettings(settings: Partial<SystemSettings>): Promise<void> {
    try {
      await axios.put(
        `${this.baseURL}/system/`,
        settings,
        this.getAuthHeaders()
      );
    } catch (error: any) {
      console.error('Failed to update system settings:', error);
      throw error;
    }
  }

  // Email Templates
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    try {
      const response = await axios.get<ApiResponse<EmailTemplate[]>>(
        `${this.baseURL}/email-templates/`,
        this.getAuthHeaders()
      );
      return response.data.data || [];
    } catch (error: any) {
      console.error('Failed to fetch email templates:', error);
      return [];
    }
  }

  async getEmailTemplateById(templateId: number): Promise<EmailTemplate> {
    try {
      const response = await axios.get<ApiResponse<EmailTemplate>>(
        `${this.baseURL}/email-templates/${templateId}/`,
        this.getAuthHeaders()
      );
      return response.data.data!;
    } catch (error: any) {
      console.error('Failed to fetch email template:', error);
      throw error;
    }
  }

  async updateEmailTemplate(templateId: number, data: Partial<EmailTemplate>): Promise<void> {
    try {
      await axios.put(
        `${this.baseURL}/email-templates/${templateId}/`,
        data,
        this.getAuthHeaders()
      );
    } catch (error: any) {
      console.error('Failed to update email template:', error);
      throw error;
    }
  }

  async testEmailTemplate(templateId: number, recipientEmail: string): Promise<void> {
    try {
      await axios.post(
        `${this.baseURL}/email-templates/${templateId}/test/`,
        { recipient_email: recipientEmail },
        this.getAuthHeaders()
      );
    } catch (error: any) {
      console.error('Failed to send test email:', error);
      throw error;
    }
  }

  // Payment Settings
  async getPaymentSettings(): Promise<PaymentSettings> {
    try {
      const response = await axios.get<ApiResponse<PaymentSettings>>(
        `${this.baseURL}/payment/`,
        this.getAuthHeaders()
      );
      return response.data.data!;
    } catch (error: any) {
      console.error('Failed to fetch payment settings:', error);
      throw error;
    }
  }

  async updatePaymentSettings(settings: Partial<PaymentSettings>): Promise<void> {
    try {
      await axios.put(
        `${this.baseURL}/payment/`,
        settings,
        this.getAuthHeaders()
      );
    } catch (error: any) {
      console.error('Failed to update payment settings:', error);
      throw error;
    }
  }

  async testPaymentConnection(): Promise<boolean> {
    try {
      const response = await axios.post<ApiResponse<{ success: boolean }>>(
        `${this.baseURL}/payment/test/`,
        {},
        this.getAuthHeaders()
      );
      return response.data.data?.success || false;
    } catch (error: any) {
      console.error('Failed to test payment connection:', error);
      return false;
    }
  }

  // Admin Users
  async getAdminUsers(): Promise<AdminUser[]> {
    try {
      const response = await axios.get<ApiResponse<AdminUser[]>>(
        `${this.baseURL}/admins/`,
        this.getAuthHeaders()
      );
      return response.data.data || [];
    } catch (error: any) {
      console.error('Failed to fetch admin users:', error);
      return [];
    }
  }

  async createAdminUser(data: Partial<AdminUser> & { password: string }): Promise<void> {
    try {
      await axios.post(
        `${this.baseURL}/admins/`,
        data,
        this.getAuthHeaders()
      );
    } catch (error: any) {
      console.error('Failed to create admin user:', error);
      throw error;
    }
  }

  async updateAdminUser(adminId: number, data: Partial<AdminUser>): Promise<void> {
    try {
      await axios.put(
        `${this.baseURL}/admins/${adminId}/`,
        data,
        this.getAuthHeaders()
      );
    } catch (error: any) {
      console.error('Failed to update admin user:', error);
      throw error;
    }
  }

  async deleteAdminUser(adminId: number): Promise<void> {
    try {
      await axios.delete(
        `${this.baseURL}/admins/${adminId}/`,
        this.getAuthHeaders()
      );
    } catch (error: any) {
      console.error('Failed to delete admin user:', error);
      throw error;
    }
  }

  // Roles and Permissions
  async getRoles(): Promise<Role[]> {
    try {
      const response = await axios.get<ApiResponse<Role[]>>(
        `${this.baseURL}/roles/`,
        this.getAuthHeaders()
      );
      return response.data.data || [];
    } catch (error: any) {
      console.error('Failed to fetch roles:', error);
      return [];
    }
  }

  async createRole(data: Partial<Role>): Promise<void> {
    try {
      await axios.post(
        `${this.baseURL}/roles/`,
        data,
        this.getAuthHeaders()
      );
    } catch (error: any) {
      console.error('Failed to create role:', error);
      throw error;
    }
  }

  async updateRole(roleId: number, data: Partial<Role>): Promise<void> {
    try {
      await axios.put(
        `${this.baseURL}/roles/${roleId}/`,
        data,
        this.getAuthHeaders()
      );
    } catch (error: any) {
      console.error('Failed to update role:', error);
      throw error;
    }
  }

  async deleteRole(roleId: number): Promise<void> {
    try {
      await axios.delete(
        `${this.baseURL}/roles/${roleId}/`,
        this.getAuthHeaders()
      );
    } catch (error: any) {
      console.error('Failed to delete role:', error);
      throw error;
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
        `${this.baseURL}/audit-logs/?${queryParams.toString()}`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch audit logs:', error);
      throw error;
    }
  }

  async exportAuditLogs(filters: AuditLogFilters = {}): Promise<Blob> {
    try {
      const queryParams = new URLSearchParams();
      if (filters.admin_id) queryParams.append('admin_id', filters.admin_id.toString());
      if (filters.action) queryParams.append('action', filters.action);
      if (filters.start_date) queryParams.append('start_date', filters.start_date);
      if (filters.end_date) queryParams.append('end_date', filters.end_date);

      const response = await axios.get(
        `${this.baseURL}/audit-logs/export/?${queryParams.toString()}`,
        {
          ...this.getAuthHeaders(),
          responseType: 'blob'
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Failed to export audit logs:', error);
      throw error;
    }
  }
}

export const settingsService = new SettingsServiceClass();
