/**
 * Ambulance/Emergency Management Type Definitions
 */

export interface AmbulanceProvider {
  id: string;
  user_id: string;
  provider_name: string;
  email: string;
  phone: string;
  service_type: string;
  registration_number: string;
  address: string;
  city: string;
  state: string;
  country: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  is_active: boolean;
  is_online: boolean;
  email_verified: boolean;
  created_at: string;
  description?: string;
  coverage_area?: string;
  statistics?: {
    total_bookings: number;
    total_vehicles: number;
    active_bookings: number;
  };
}

export interface AmbulanceProviderListParams {
  page?: number;
  page_size?: number;
  search?: string;
  service_type?: string;
  verification_status?: 'pending' | 'verified' | 'rejected' | '';
}

export interface EmergencyBooking {
  id: string;
  booking_number: string;
  patient_name: string;
  patient_phone: string;
  provider_name: string;
  provider_id: string;
  pickup_location: string;
  dropoff_location: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  booking_date: string;
  pickup_time?: string;
  completion_time?: string;
  emergency_type: string;
  notes?: string;
}

export interface Vehicle {
  id: string;
  vehicle_number: string;
  vehicle_type: string;
  registration_number: string;
  model: string;
  year: number;
  status: 'active' | 'inactive' | 'maintenance';
  is_available: boolean;
  last_service_date?: string;
  next_service_date?: string;
}

export interface ProviderAvailability {
  provider_id: string;
  provider_name: string;
  is_online: boolean;
  available_vehicles: number;
  active_bookings: number;
  coverage_area: string;
  last_active: string;
}

export interface AmbulanceDocument {
  id: string;
  document_type: string;
  document_url: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  uploaded_at: string;
  verified_at?: string;
  rejection_reason?: string;
}
