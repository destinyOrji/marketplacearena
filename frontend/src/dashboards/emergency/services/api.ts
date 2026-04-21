// API service functions for Emergency Services Dashboard

import apiClient from './apiClient';
import {
  EmergencyProvider,
  EmergencyProviderProfile,
  EmergencyService,
  ActiveEmergency,
  EmergencyBooking,
  EarningsSummary,
  PaymentTransaction,
  CoverageZone,
  Vehicle,
  Equipment,
  PerformanceMetrics,
  Notification,
  ProviderSettings,
  DashboardStats,
} from '../types';

// ============================================================================
// Authentication API
// ============================================================================

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  register: async (data: any) => {
    // Add role to registration data
    const registrationData = {
      ...data,
      role: 'ambulance'
    };
    const response = await apiClient.post('/auth/register', registrationData);
    return response.data;
  },
};

// ============================================================================
// Provider Profile API
// ============================================================================

export const profileApi = {
  getProfile: async (): Promise<EmergencyProvider> => {
    const response = await apiClient.get('/ambulance/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<EmergencyProviderProfile>): Promise<EmergencyProvider> => {
    const response = await apiClient.put('/ambulance/profile/update', data);
    return response.data;
  },

  uploadPhoto: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('photo', file);
    const response = await apiClient.post('/ambulance/upload-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.photoUrl;
  },

  uploadDocument: async (file: File, documentType: string): Promise<string> => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', documentType);
    const response = await apiClient.post('/ambulance/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.documentUrl;
  },
};

// ============================================================================
// Services API
// ============================================================================

export const servicesApi = {
  getServices: async (): Promise<EmergencyService[]> => {
    const response = await apiClient.get('/ambulance/services');
    return response.data;
  },

  getService: async (id: string): Promise<EmergencyService> => {
    const response = await apiClient.get(`/ambulance/services/${id}`);
    return response.data;
  },

  createService: async (data: Partial<EmergencyService>): Promise<EmergencyService> => {
    const response = await apiClient.post('/ambulance/services/create', data);
    return response.data;
  },

  updateService: async (id: string, data: Partial<EmergencyService>): Promise<EmergencyService> => {
    const response = await apiClient.put(`/ambulance/services/${id}/update`, data);
    return response.data;
  },

  deleteService: async (id: string): Promise<void> => {
    await apiClient.delete(`/ambulance/services/${id}/delete`);
  },
};

// ============================================================================
// Availability API
// ============================================================================

export const availabilityApi = {
  getAvailability: async (): Promise<boolean> => {
    const response = await apiClient.get('/ambulance/availability');
    return response.data.isAvailable;
  },

  setAvailability: async (available: boolean): Promise<void> => {
    await apiClient.put('/ambulance/availability/toggle', { available });
  },
};

// ============================================================================
// Bookings API
// ============================================================================

export const bookingsApi = {
  getBookings: async (filters?: any): Promise<EmergencyBooking[]> => {
    const response = await apiClient.get('/ambulance/bookings', { params: filters });
    return response.data;
  },

  getBooking: async (id: string): Promise<ActiveEmergency> => {
    const response = await apiClient.get(`/ambulance/bookings/${id}`);
    return response.data;
  },

  acceptBooking: async (bookingId: string): Promise<ActiveEmergency> => {
    const response = await apiClient.post(`/ambulance/bookings/${bookingId}/accept`);
    return response.data;
  },

  declineBooking: async (bookingId: string): Promise<void> => {
    await apiClient.post(`/ambulance/bookings/${bookingId}/decline`);
  },

  updateBookingStatus: async (bookingId: string, status: string, notes?: string): Promise<ActiveEmergency> => {
    const response = await apiClient.put(`/ambulance/bookings/${bookingId}/status`, { status, notes });
    return response.data;
  },

  getActiveEmergency: async (): Promise<ActiveEmergency | null> => {
    const response = await apiClient.get('/ambulance/bookings/active');
    return response.data;
  },
};

// ============================================================================
// Payments API
// ============================================================================

export const paymentsApi = {
  getEarningsSummary: async (): Promise<EarningsSummary> => {
    const response = await apiClient.get('/ambulance/earnings');
    return response.data;
  },

  getPayments: async (filters?: any): Promise<PaymentTransaction[]> => {
    const response = await apiClient.get('/ambulance/payments', { params: filters });
    return response.data;
  },

  addPaymentMethod: async (data: any): Promise<any> => {
    const response = await apiClient.post('/ambulance/payment-methods', data);
    return response.data;
  },

  updatePaymentMethod: async (id: string, data: any): Promise<any> => {
    const response = await apiClient.put(`/ambulance/payment-methods/${id}`, data);
    return response.data;
  },

  deletePaymentMethod: async (id: string): Promise<void> => {
    await apiClient.delete(`/ambulance/payment-methods/${id}`);
  },
};

// ============================================================================
// Coverage Areas API
// ============================================================================

export const coverageApi = {
  getCoverageAreas: async (): Promise<CoverageZone[]> => {
    const response = await apiClient.get('/ambulance/coverage-area');
    return response.data;
  },

  createCoverageArea: async (data: Partial<CoverageZone>): Promise<CoverageZone> => {
    const response = await apiClient.post('/ambulance/coverage-area/create', data);
    return response.data;
  },

  updateCoverageArea: async (id: string, data: Partial<CoverageZone>): Promise<CoverageZone> => {
    const response = await apiClient.put(`/ambulance/coverage-area/${id}/update`, data);
    return response.data;
  },

  deleteCoverageArea: async (id: string): Promise<void> => {
    await apiClient.delete(`/ambulance/coverage-area/${id}/delete`);
  },
};

// ============================================================================
// Vehicles API
// ============================================================================

export const vehiclesApi = {
  getVehicles: async (): Promise<Vehicle[]> => {
    const response = await apiClient.get('/ambulance/vehicles');
    return response.data;
  },

  createVehicle: async (data: Partial<Vehicle>): Promise<Vehicle> => {
    const response = await apiClient.post('/ambulance/vehicles/create', data);
    return response.data;
  },

  updateVehicle: async (id: string, data: Partial<Vehicle>): Promise<Vehicle> => {
    const response = await apiClient.put(`/ambulance/vehicles/${id}/update`, data);
    return response.data;
  },

  deleteVehicle: async (id: string): Promise<void> => {
    await apiClient.delete(`/ambulance/vehicles/${id}/delete`);
  },
};

// ============================================================================
// Equipment API
// ============================================================================

export const equipmentApi = {
  getEquipment: async (): Promise<Equipment[]> => {
    const response = await apiClient.get('/ambulance/equipment');
    return response.data;
  },

  createEquipment: async (data: Partial<Equipment>): Promise<Equipment> => {
    const response = await apiClient.post('/ambulance/equipment/create', data);
    return response.data;
  },

  updateEquipment: async (id: string, data: Partial<Equipment>): Promise<Equipment> => {
    const response = await apiClient.put(`/ambulance/equipment/${id}/update`, data);
    return response.data;
  },

  deleteEquipment: async (id: string): Promise<void> => {
    await apiClient.delete(`/ambulance/equipment/${id}/delete`);
  },
};

// ============================================================================
// Analytics API
// ============================================================================

export const analyticsApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/ambulance/dashboard-stats');
    return response.data;
  },

  getPerformanceMetrics: async (period?: string): Promise<PerformanceMetrics> => {
    const response = await apiClient.get('/ambulance/analytics', { params: { period } });
    return response.data;
  },

  exportReport: async (format: 'pdf' | 'csv', period?: string): Promise<Blob> => {
    const response = await apiClient.get('/ambulance/analytics/export', {
      params: { format, period },
      responseType: 'blob',
    });
    return response.data;
  },
};

// ============================================================================
// Notifications API
// ============================================================================

export const notificationsApi = {
  getNotifications: async (): Promise<Notification[]> => {
    const response = await apiClient.get('/ambulance/notifications');
    return response.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    await apiClient.put(`/ambulance/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.put('/ambulance/notifications/read-all');
  },
};

// ============================================================================
// Settings API
// ============================================================================

export const settingsApi = {
  getSettings: async (): Promise<ProviderSettings> => {
    const response = await apiClient.get('/ambulance/settings');
    return response.data;
  },

  updateSettings: async (settings: Partial<ProviderSettings>): Promise<ProviderSettings> => {
    const response = await apiClient.put('/ambulance/settings/update', settings);
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiClient.post('/ambulance/change-password', { currentPassword, newPassword });
  },
};
