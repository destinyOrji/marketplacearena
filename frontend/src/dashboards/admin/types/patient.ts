/**
 * Patient Management Type Definitions
 */

export interface Patient {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  address?: string;
  city?: string;
  state?: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  statistics?: {
    total_appointments: number;
    total_emergencies: number;
  };
}

export interface PatientListParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: 'active' | 'inactive' | '';
}

export interface PatientAppointment {
  id: string;
  professional_name: string;
  professional_type: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  service_type: string;
  created_at: string;
}

export interface PatientMedicalRecord {
  id: string;
  record_type: string;
  date: string;
  provider_name: string;
  description: string;
  document_url?: string;
}

export interface PatientEmergencyBooking {
  id: string;
  booking_date: string;
  status: string;
  ambulance_provider: string;
  pickup_location: string;
  destination: string;
  emergency_type: string;
  created_at: string;
}
