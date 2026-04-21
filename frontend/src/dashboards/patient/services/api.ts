import apiClient from './apiClient';
import {
  User,
  ServiceProvider,
  Appointment,
  Payment,
  MedicalRecord,
  Notification,
  FeedbackSubmission,
  UserProfile,
  ApiResponse,
  PaginatedResponse,
} from '../types';

// Authentication API
export const authApi = {
  register: (data: any) => apiClient.post<ApiResponse<User>>('/auth/register', data),
  login: (email: string, password: string) =>
    apiClient.post<ApiResponse<{ user: User; token: string }>>('/auth/login', { email, password }),
  logout: () => apiClient.post<ApiResponse<null>>('/auth/logout'),
  verifyOTP: (email: string, otpCode: string) =>
    apiClient.post<ApiResponse<{ user: User; token: string }>>('/auth/verify-otp', { email, otpCode }),
  resendOTP: (email: string) =>
    apiClient.post<ApiResponse<null>>('/auth/resend-otp', { email }),
  forgotPassword: (email: string) =>
    apiClient.post<ApiResponse<null>>('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    apiClient.post<ApiResponse<null>>('/auth/reset-password', { token, password }),
  resetPasswordWithOTP: (phone: string, otpCode: string, newPassword: string) =>
    apiClient.post<ApiResponse<null>>('/auth/reset-password-otp', { phone, otpCode, newPassword }),
};

// Patient Profile API
export const patientApi = {
  getProfile: () => apiClient.get<ApiResponse<User>>('/client/profile'),
  updateProfile: (data: Partial<UserProfile>) =>
    apiClient.put<ApiResponse<User>>('/client/profile/update', data),
  uploadPhoto: (formData: FormData) =>
    apiClient.post<ApiResponse<{ photoUrl: string }>>('/client/upload-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.put<ApiResponse<null>>('/client/profile/password', {
      currentPassword,
      newPassword,
    }),
};

// Services API
export const servicesApi = {
  getServices: (params?: any) =>
    apiClient.get<ApiResponse<PaginatedResponse<ServiceProvider>>>('/client/services', { params }),
  getServiceById: (id: string) =>
    apiClient.get<ApiResponse<ServiceProvider>>(`/client/services/${id}`),
  getAvailability: (id: string, date?: string) =>
    apiClient.get<ApiResponse<any>>(`/client/services/${id}/availability`, {
      params: { date },
    }),
};

// Appointments API
export const appointmentsApi = {
  getAppointments: (params?: any) =>
    apiClient.get<ApiResponse<PaginatedResponse<Appointment>>>('/client/appointments', { params }),
  getAppointmentById: (id: string) =>
    apiClient.get<ApiResponse<Appointment>>(`/client/appointments/${id}`),
  createAppointment: (data: any) =>
    apiClient.post<ApiResponse<Appointment>>('/client/appointments/book', data),
  cancelAppointment: (id: string, reason?: string) =>
    apiClient.put<ApiResponse<Appointment>>(`/client/appointments/${id}/cancel`, { reason }),
  rescheduleAppointment: (id: string, data: any) =>
    apiClient.put<ApiResponse<Appointment>>(`/client/appointments/${id}/reschedule`, data),
};

// Emergency Services API
export const emergencyApi = {
  getAmbulances: (params: any) =>
    apiClient.get<ApiResponse<any[]>>('/client/emergency/providers', { params }),
  bookAmbulance: (data: any) =>
    apiClient.post<ApiResponse<any>>('/client/emergency/book', data),
  trackAmbulance: (bookingId: string) =>
    apiClient.get<ApiResponse<any>>(`/client/emergency/${bookingId}/track`),
};

// Payments API
export const paymentsApi = {
  getPayments: (params?: any) =>
    apiClient.get<ApiResponse<PaginatedResponse<Payment>>>('/client/payments', { params }),
  processPayment: (data: any) =>
    apiClient.post<ApiResponse<Payment>>('/client/payments', data),
  getReceipt: (id: string) =>
    apiClient.get<ApiResponse<{ receiptUrl: string }>>(`/client/payments/${id}/receipt`),
};

// Feedback API
export const feedbackApi = {
  getFeedback: () =>
    apiClient.get<ApiResponse<any[]>>('/feedback'),
  submitFeedback: (data: FeedbackSubmission) =>
    apiClient.post<ApiResponse<any>>('/feedback', data),
  updateFeedback: (id: string, data: Partial<FeedbackSubmission>) =>
    apiClient.put<ApiResponse<any>>(`/feedback/${id}`, data),
  deleteFeedback: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/feedback/${id}`),
};

// Medical Records API
export const medicalRecordsApi = {
  getRecords: (params?: any) =>
    apiClient.get<ApiResponse<PaginatedResponse<MedicalRecord>>>('/medical-records', { params }),
  getRecordById: (id: string) =>
    apiClient.get<ApiResponse<MedicalRecord>>(`/medical-records/${id}`),
  downloadRecord: (id: string) =>
    apiClient.get<Blob>(`/medical-records/${id}/download`, {
      responseType: 'blob',
    }),
};

// Notifications API
export const notificationsApi = {
  getNotifications: (params?: any) =>
    apiClient.get<ApiResponse<PaginatedResponse<Notification>>>('/users/notifications', { params }),
  markAsRead: (id: string) =>
    apiClient.put<ApiResponse<Notification>>(`/users/notifications/${id}/read`),
  markAllAsRead: () =>
    apiClient.put<ApiResponse<null>>('/users/notifications/read-all'),
};

export default {
  auth: authApi,
  patient: patientApi,
  services: servicesApi,
  appointments: appointmentsApi,
  emergency: emergencyApi,
  payments: paymentsApi,
  feedback: feedbackApi,
  medicalRecords: medicalRecordsApi,
  notifications: notificationsApi,
};
