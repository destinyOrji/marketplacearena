/**
 * Settings Management Type Definitions
 */

export interface SystemSettings {
  platform_name: string;
  support_email: string;
  support_phone: string;
  maintenance_mode: boolean;
  registration_enabled: boolean;
  max_upload_size_mb: number;
  session_timeout_minutes: number;
}

export interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  created_at: string;
  updated_at: string;
}

export interface PaymentSettings {
  provider: string;
  api_key: string;
  secret_key: string;
  webhook_url: string;
  test_mode: boolean;
  platformFeePercent?: number;
  adminBankAccount?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    bankCode: string;
  };
}

export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  permissions: Record<string, boolean>;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem?: boolean;
}

export interface AvailablePermission {
  key: string;
  label: string;
  group: string;
}

export interface AuditLog {
  id: number;
  admin_id: number;
  admin_name: string;
  action: string;
  resource: string;
  resource_id?: number;
  details?: string;
  ip_address: string;
  timestamp: string;
}

export interface AuditLogFilters {
  admin_id?: number;
  action?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  page_size?: number;
}

export interface ApiResponse<T = any> {
  statuscode: number;
  status: string;
  message?: string;
  data?: T;
}

export interface PaginationMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}
