// API service functions for Professional Dashboard

import apiClient from './apiClient';
import {
  Professional,
  ProfessionalProfile,
  Service,
  JobPosting,
  JobApplication,
  Appointment,
  WeeklySchedule,
  BlockedDate,
  EarningsSummary,
  PaymentTransaction,
  PerformanceMetrics,
  Notification,
  ProfessionalSettings,
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
      role: 'professional'
    };
    const response = await apiClient.post('/auth/register', registrationData);
    return response.data;
  },
};

// ============================================================================
// Professional Profile API
// ============================================================================

export const profileApi = {
  getProfile: async (): Promise<Professional> => {
    const response = await apiClient.get('/professionals/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<ProfessionalProfile>): Promise<Professional> => {
    const response = await apiClient.put('/professionals/profile/update', data);
    return response.data;
  },

  uploadPhoto: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('photo', file);
    const response = await apiClient.post('/professionals/upload-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.data?.photoUrl || response.data?.photoUrl || '';
  },

  uploadDocument: async (file: File, documentType: string): Promise<string> => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', documentType);
    const response = await apiClient.post('/professionals/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.documentUrl;
  },
};

// ============================================================================
// Services API
// ============================================================================

export const servicesApi = {
  getServices: async (): Promise<Service[]> => {
    const response = await apiClient.get('/professionals/services');
    const payload = response.data?.data ?? response.data;
    return Array.isArray(payload) ? payload : [];
  },

  getService: async (id: string): Promise<Service> => {
    const response = await apiClient.get(`/professionals/services/${id}`);
    return response.data?.data ?? response.data;
  },

  createService: async (data: Partial<Service>): Promise<Service> => {
    const response = await apiClient.post('/professionals/services/create', data);
    const serviceData = response.data?.data ?? response.data;
    // Ensure we return a proper service object with required fields
    return {
      id: serviceData.id || Date.now().toString(),
      title: serviceData.title || data.title || '',
      description: serviceData.description || data.description || '',
      category: serviceData.category || data.category || '',
      price: serviceData.price ?? data.price ?? 0,
      duration: serviceData.duration ?? data.duration ?? 30,
      consultationType: serviceData.consultationType || data.consultationType || [],
      status: serviceData.status || 'active',
      images: serviceData.images || [],
      ...serviceData,
    };
  },

  updateService: async (id: string, data: Partial<Service>): Promise<Service> => {
    const response = await apiClient.put(`/professionals/services/${id}/update`, data);
    return response.data?.data ?? response.data;
  },

  deleteService: async (id: string): Promise<void> => {
    await apiClient.delete(`/professionals/services/${id}/delete`);
  },
};

// ============================================================================
// Jobs API
// ============================================================================

// Helper to map backend employment type to frontend type
const mapEmploymentType = (type: string): 'full-time' | 'part-time' | 'contract' | 'per-diem' => {
  const map: Record<string, 'full-time' | 'part-time' | 'contract' | 'per-diem'> = {
    full_time: 'full-time', full: 'full-time',
    part_time: 'part-time', part: 'part-time',
    contract: 'contract', temporary: 'contract',
    per_diem: 'per-diem',
  };
  return map[type?.toLowerCase()] || 'full-time';
};

export const jobsApi = {
  getJobs: async (filters?: any): Promise<JobPosting[]> => {
    const response = await apiClient.get('/jobs', { params: filters });
    const payload = response.data?.data ?? response.data;
    const list = Array.isArray(payload) ? payload : [];

    // Map backend camelCase fields to JobPosting type
    return list.map((job: any): JobPosting => ({
      id: job._id || job.id || '',
      title: job.jobTitle || job.title || 'Untitled',
      description: job.jobDescription || job.description || '',
      specialty: job.department || job.specialty || '',
      location: [job.hospital?.city, job.hospital?.state].filter(Boolean).join(', ') || job.location || 'On-site',
      jobType: mapEmploymentType(job.employmentType || job.jobType || 'full_time'),
      compensation: {
        type: job.salaryRangeMin ? 'fixed' : 'negotiable',
        amount: job.salaryRangeMin || undefined,
      },
      postedDate: new Date(job.publishedAt || job.createdAt || Date.now()),
      applicationDeadline: new Date(job.applicationDeadline || Date.now() + 30 * 24 * 60 * 60 * 1000),
      hasApplied: job.hasApplied || false,
      // Extra fields for display
      hospitalName: job.hospital?.name || '',
      experienceLevel: job.experienceLevel || '',
      salaryMin: job.salaryRangeMin,
      salaryMax: job.salaryRangeMax,
      currency: job.salaryCurrency || 'NGN',
      benefits: job.benefits || [],
      requiredQualifications: job.requiredQualifications || [],
    } as any));
  },

  getJob: async (id: string): Promise<JobPosting> => {
    const response = await apiClient.get(`/jobs/${id}`);
    return response.data?.data ?? response.data;
  },

  applyForJob: async (jobId: string, data: { coverLetter: string; attachments?: File[] }): Promise<JobApplication> => {
    const response = await apiClient.post(`/jobs/${jobId}/apply`, {
      coverLetter: data.coverLetter,
    });
    return response.data?.data ?? response.data;
  },

  getApplications: async (): Promise<JobApplication[]> => {
    const response = await apiClient.get('/jobs/my/applications');
    const payload = response.data?.data ?? response.data;
    const list = Array.isArray(payload) ? payload : [];
    return list.map((app: any): JobApplication => ({
      id: app._id || app.id || '',
      status: app.status || 'pending',
      coverLetter: app.coverLetter || '',
      appliedDate: new Date(app.createdAt || app.appliedDate || Date.now()),
      job: {
        id: app.job?.id || app.job?._id || '',
        title: app.job?.jobTitle || app.job?.title || 'N/A',
        description: app.job?.jobDescription || app.job?.description || '',
        specialty: app.job?.department || app.job?.specialty || '',
        location: app.job?.location || 'On-site',
        jobType: (app.job?.employmentType || app.job?.jobType || 'full-time').replace(/_/g, '-') as any,
        compensation: app.job?.compensation || { type: 'negotiable' },
        postedDate: new Date(app.job?.publishedAt || app.job?.createdAt || Date.now()),
        applicationDeadline: new Date(app.job?.applicationDeadline || Date.now() + 30 * 24 * 60 * 60 * 1000),
        hasApplied: true,
      },
    }));
  },

  acceptOffer: async (applicationId: string): Promise<JobApplication> => {
    const response = await apiClient.post(`/applications/${applicationId}/accept`);
    return response.data?.data ?? response.data;
  },

  declineOffer: async (applicationId: string, reason?: string): Promise<JobApplication> => {
    const response = await apiClient.post(`/applications/${applicationId}/decline`, { reason });
    return response.data?.data ?? response.data;
  },
};

// ============================================================================
// Appointments API
// ============================================================================

export const appointmentsApi = {
  getAppointments: async (filters?: any): Promise<Appointment[]> => {
    const response = await apiClient.get('/professionals/appointments', { params: filters });
    const payload = response.data?.data ?? response.data;
    return Array.isArray(payload) ? payload : [];
  },

  confirmAppointment: async (id: string, notes?: string): Promise<Appointment> => {
    const response = await apiClient.put(`/professionals/appointments/${id}/confirm`, { notes });
    return response.data?.data ?? response.data;
  },

  cancelAppointment: async (id: string, reason: string): Promise<Appointment> => {
    const response = await apiClient.put(`/professionals/appointments/${id}/cancel`, { reason });
    return response.data?.data ?? response.data;
  },

  completeAppointment: async (id: string): Promise<Appointment> => {
    const response = await apiClient.put(`/professionals/appointments/${id}/complete`);
    return response.data?.data ?? response.data;
  },

  rescheduleAppointment: async (id: string, newDate: Date, newTime: string): Promise<Appointment> => {
    const response = await apiClient.put(`/professionals/appointments/${id}/reschedule`, { date: newDate, time: newTime });
    return response.data?.data ?? response.data;
  },
};

// ============================================================================
// Schedule API
// ============================================================================

export const scheduleApi = {
  getSchedule: async (): Promise<WeeklySchedule> => {
    const response = await apiClient.get('/professionals/schedule');
    return response.data?.data ?? response.data ?? {};
  },

  updateSchedule: async (schedule: WeeklySchedule): Promise<WeeklySchedule> => {
    const response = await apiClient.put('/professionals/schedule/update', schedule);
    return response.data?.data ?? response.data;
  },

  getBlockedDates: async (): Promise<BlockedDate[]> => {
    const response = await apiClient.get('/professionals/schedule/blocked-dates');
    const payload = response.data?.data ?? response.data;
    return Array.isArray(payload) ? payload : [];
  },

  blockDate: async (date: Date, reason: string): Promise<BlockedDate> => {
    const response = await apiClient.post('/professionals/schedule/block-date', { date, reason });
    return response.data?.data ?? response.data;
  },

  unblockDate: async (id: string): Promise<void> => {
    await apiClient.delete(`/professionals/schedule/blocked-dates/${id}`);
  },
};

// ============================================================================
// Payments API
// ============================================================================

export const paymentsApi = {
  getEarningsSummary: async (): Promise<EarningsSummary> => {
    const response = await apiClient.get('/professionals/earnings');
    return response.data?.data ?? response.data ?? { totalEarnings: 0, pendingPayments: 0, completedPayments: 0, platformFees: 0, netEarnings: 0 };
  },

  getPayments: async (filters?: any): Promise<PaymentTransaction[]> => {
    const response = await apiClient.get('/professionals/payments', { params: filters });
    const payload = response.data?.data ?? response.data;
    return Array.isArray(payload) ? payload : [];
  },

  addPaymentMethod: async (data: any): Promise<any> => {
    const response = await apiClient.post('/professionals/payment-methods', data);
    return response.data?.data ?? response.data;
  },

  updatePaymentMethod: async (id: string, data: any): Promise<any> => {
    const response = await apiClient.put(`/professionals/payment-methods/${id}`, data);
    return response.data?.data ?? response.data;
  },

  deletePaymentMethod: async (id: string): Promise<void> => {
    await apiClient.delete(`/professionals/payment-methods/${id}`);
  },
};

// ============================================================================
// Analytics API
// ============================================================================

export const analyticsApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/professionals/dashboard-stats');
    // Handle { success: true, data: { ... } } response shape
    const payload = response.data?.data ?? response.data;
    return {
      totalEarnings: payload?.totalEarnings ?? 0,
      pendingPayments: payload?.pendingPayments ?? 0,
      upcomingAppointments: payload?.upcomingAppointments ?? 0,
      activeServices: payload?.activeServices ?? 0,
      completionRate: payload?.completionRate ?? 0,
      averageRating: payload?.averageRating ?? 0,
    };
  },

  getPerformanceMetrics: async (period?: string): Promise<PerformanceMetrics> => {
    const response = await apiClient.get('/professionals/analytics', { params: { period } });
    return response.data;
  },

  exportReport: async (format: 'pdf' | 'csv', period?: string): Promise<Blob> => {
    const response = await apiClient.get('/professionals/analytics/export', {
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
    try {
      const response = await apiClient.get('/users/notifications');
      const payload = response.data?.data ?? response.data;
      return Array.isArray(payload) ? payload : [];
    } catch {
      return [];
    }
  },

  markAsRead: async (id: string): Promise<void> => {
    await apiClient.put(`/users/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.put('/users/notifications/read-all');
  },
};

// ============================================================================
// Settings API
// ============================================================================

export const settingsApi = {
  getSettings: async (): Promise<ProfessionalSettings> => {
    const response = await apiClient.get('/professionals/settings');
    return response.data?.data ?? response.data ?? { notifications: { email: true, sms: true, inApp: true, jobAlerts: true }, privacy: { profileVisibility: 'public', showRatings: true } };
  },

  updateSettings: async (settings: Partial<ProfessionalSettings>): Promise<ProfessionalSettings> => {
    const response = await apiClient.put('/professionals/settings/update', settings);
    return response.data?.data ?? response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiClient.post('/professionals/change-password', { currentPassword, newPassword });
  },
};
