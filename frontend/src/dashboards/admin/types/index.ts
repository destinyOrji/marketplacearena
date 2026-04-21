/**
 * Admin Dashboard Type Definitions
 */

export interface AdminProfile {
  id: string;
  email: string;
  role: string;
  permissions: Record<string, any>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ApiResponse<T = any> {
  statuscode: number;
  status: string;
  message: string;
  data?: T;
}

export interface PaginationParams {
  page?: number;
  page_size?: number;
  search?: string;
}

export interface PaginationMeta {
  total: number;
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Re-export patient types
export * from './patient';

// Re-export professional types
export * from './professional';

// Re-export hospital types
export * from './hospital';

// Re-export ambulance types
export * from './ambulance';

// Re-export settings types
export * from './settings';
