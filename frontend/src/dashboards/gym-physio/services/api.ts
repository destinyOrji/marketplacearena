// API service for Gym & Physiotherapy Dashboard

import axios from 'axios';
import type { GymPhysioProfile, Service, Appointment, Schedule, DashboardStats } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('gymPhysioToken') || localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Dashboard Stats
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await apiClient.get('/gym-physio/dashboard-stats');
  return response.data.data;
};

// Profile
export const getProfile = async (): Promise<GymPhysioProfile> => {
  const response = await apiClient.get('/gym-physio/profile');
  return response.data.data;
};

export const updateProfile = async (data: Partial<GymPhysioProfile>): Promise<GymPhysioProfile> => {
  const response = await apiClient.put('/gym-physio/profile/update', data);
  return response.data.data;
};

export const uploadPhoto = async (file: File): Promise<{ photoUrl: string }> => {
  const formData = new FormData();
  formData.append('photo', file);
  const response = await apiClient.post('/gym-physio/upload-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
};

export const uploadDocument = async (file: File): Promise<{ documentUrl: string }> => {
  const formData = new FormData();
  formData.append('document', file);
  const response = await apiClient.post('/gym-physio/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
};

// Services
export const getServices = async (): Promise<Service[]> => {
  const response = await apiClient.get('/gym-physio/services');
  return response.data.data;
};

export const getService = async (id: string): Promise<Service> => {
  const response = await apiClient.get(`/gym-physio/services/${id}`);
  return response.data.data;
};

export const createService = async (data: Partial<Service>): Promise<Service> => {
  const response = await apiClient.post('/gym-physio/services/create', data);
  return response.data.data;
};

export const updateService = async (id: string, data: Partial<Service>): Promise<Service> => {
  const response = await apiClient.put(`/gym-physio/services/${id}/update`, data);
  return response.data.data;
};

export const deleteService = async (id: string): Promise<void> => {
  await apiClient.delete(`/gym-physio/services/${id}/delete`);
};

// Appointments
export const getAppointments = async (): Promise<Appointment[]> => {
  const response = await apiClient.get('/gym-physio/appointments');
  return response.data.data;
};

export const confirmAppointment = async (id: string): Promise<void> => {
  await apiClient.put(`/gym-physio/appointments/${id}/confirm`);
};

export const cancelAppointment = async (id: string): Promise<void> => {
  await apiClient.put(`/gym-physio/appointments/${id}/cancel`);
};

export const completeAppointment = async (id: string): Promise<void> => {
  await apiClient.put(`/gym-physio/appointments/${id}/complete`);
};

// Schedule
export const getSchedule = async (): Promise<Schedule> => {
  const response = await apiClient.get('/gym-physio/schedule');
  return response.data.data;
};

export const updateSchedule = async (data: Schedule): Promise<Schedule> => {
  const response = await apiClient.put('/gym-physio/schedule/update', data);
  return response.data.data;
};

export const getBlockedDates = async (): Promise<any[]> => {
  const response = await apiClient.get('/gym-physio/schedule/blocked-dates');
  return response.data.data;
};

export const blockDate = async (date: string, reason: string): Promise<void> => {
  await apiClient.post('/gym-physio/schedule/block-date', { date, reason });
};

export const unblockDate = async (id: string): Promise<void> => {
  await apiClient.delete(`/gym-physio/schedule/blocked-dates/${id}`);
};

// Earnings
export const getEarnings = async (): Promise<any> => {
  const response = await apiClient.get('/gym-physio/earnings');
  return response.data.data;
};

export const getPayments = async (): Promise<any[]> => {
  const response = await apiClient.get('/gym-physio/payments');
  return response.data.data;
};

// Analytics
export const getAnalytics = async (): Promise<any> => {
  const response = await apiClient.get('/gym-physio/analytics');
  return response.data.data;
};

// Settings
export const getSettings = async (): Promise<any> => {
  const response = await apiClient.get('/gym-physio/settings');
  return response.data.data;
};

export const updateSettings = async (data: any): Promise<void> => {
  await apiClient.put('/gym-physio/settings/update', data);
};

export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  await apiClient.post('/gym-physio/change-password', { currentPassword, newPassword });
};

export default {
  getDashboardStats,
  getProfile,
  updateProfile,
  uploadPhoto,
  uploadDocument,
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  getAppointments,
  confirmAppointment,
  cancelAppointment,
  completeAppointment,
  getSchedule,
  updateSchedule,
  getBlockedDates,
  blockDate,
  unblockDate,
  getEarnings,
  getPayments,
  getAnalytics,
  getSettings,
  updateSettings,
  changePassword,
};
