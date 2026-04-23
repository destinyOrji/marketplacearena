import axios from 'axios';
import { authService } from './authService';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://healthmarketarena.com/api';

class DashboardService {
  private readonly baseURL = `${API_BASE_URL}/admin/dashboard`;

  private getAuthHeaders() {
    const token = authService.getAccessToken();
    return { headers: { Authorization: `Bearer ${token}` } };
  }

  async getStats(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/stats`, this.getAuthHeaders());
      return response.data?.data || response.data;
    } catch { return {}; }
  }

  // Transform backend format: [{_id: "2024-01-15", registrations: [{role, count}], total}]
  // Into chart format: [{date: "Jan 15", hospitals: 2, professionals: 3, patients: 5, ambulances: 1}]
  async getRegistrationTrends(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseURL}/registration-trends`, this.getAuthHeaders());
      const raw = response.data?.data || [];
      return raw.map((item: any) => {
        const point: any = { date: item._id || item.date || '' };
        // Flatten registrations array into named keys
        if (Array.isArray(item.registrations)) {
          item.registrations.forEach((r: any) => {
            point[r.role] = r.count;
          });
        }
        point.total = item.total || 0;
        // Normalize role names
        point.hospitals = point.hospital || point.hospitals || 0;
        point.professionals = point.professional || point.professionals || 0;
        point.patients = point.client || point.patients || 0;
        point.ambulances = point.ambulance || point.ambulances || 0;
        return point;
      });
    } catch { return []; }
  }

  // Transform backend format: [{_id: "scheduled", count: 45}]
  // Into chart format: [{month: "Appointments", scheduled: 45, completed: 120, cancelled: 8}]
  async getAppointmentStats(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseURL}/appointment-stats`, this.getAuthHeaders());
      const raw = response.data?.data || [];
      if (!Array.isArray(raw) || raw.length === 0) return [];

      // Group by status into a single bar chart entry
      const grouped: any = { month: 'All Time', scheduled: 0, completed: 0, cancelled: 0 };
      raw.forEach((item: any) => {
        const status = item._id || item.status || '';
        const count = item.count || 0;
        if (status === 'scheduled' || status === 'confirmed') grouped.scheduled += count;
        else if (status === 'completed') grouped.completed += count;
        else if (status === 'cancelled') grouped.cancelled += count;
      });
      return [grouped];
    } catch { return []; }
  }

  // Transform backend format: [{status: "pending", count: 0}]
  // Into chart format: [{date: "Emergency", bookings: 5, completed: 3}]
  async getEmergencyStats(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseURL}/emergency-stats`, this.getAuthHeaders());
      const raw = response.data?.data || [];
      if (!Array.isArray(raw) || raw.length === 0) return [];

      const totals: any = { date: 'Emergency Stats', bookings: 0, completed: 0 };
      raw.forEach((item: any) => {
        const status = item.status || item._id || '';
        const count = item.count || 0;
        totals.bookings += count;
        if (status === 'completed') totals.completed += count;
      });
      return [totals];
    } catch { return []; }
  }

  // Transform backend format: [{category: "Consultations", amount: 0}]
  // Into chart format: [{source: "Consultations", amount: 0, percentage: 0}]
  async getRevenueDistribution(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseURL}/revenue-distribution`, this.getAuthHeaders());
      const raw = response.data?.data || [];
      const total = raw.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
      return raw.map((item: any) => ({
        source: item.category || item.source || 'Other',
        amount: item.amount || 0,
        percentage: total > 0 ? Math.round(((item.amount || 0) / total) * 100) : 0,
      }));
    } catch { return []; }
  }

  async getRecentActivities(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseURL}/recent-activities`, this.getAuthHeaders());
      return response.data?.data || [];
    } catch { return []; }
  }
}

export const dashboardService = new DashboardService();
