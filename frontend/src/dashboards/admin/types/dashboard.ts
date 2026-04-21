/**
 * Dashboard Type Definitions
 */

export interface DashboardStats {
  total_hospitals: number;
  total_professionals: number;
  total_patients: number;
  total_ambulances: number;
  active_appointments: number;
  pending_verifications: number;
  total_revenue: number;
  emergency_bookings: number;
}

export interface RegistrationTrend {
  date: string;
  hospitals: number;
  professionals: number;
  patients: number;
  ambulances: number;
}

export interface AppointmentStats {
  month: string;
  scheduled: number;
  completed: number;
  cancelled: number;
}

export interface EmergencyStats {
  date: string;
  bookings: number;
  completed: number;
}

export interface RevenueDistribution {
  source: string;
  amount: number;
  percentage: number;
}

export interface RecentActivity {
  id: number;
  type: string;
  user: {
    name: string;
    email: string;
    role: string;
  };
  action: string;
  description: string;
  timestamp: string;
}
