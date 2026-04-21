/**
 * Professional Management Type Definitions
 */

export interface Professional {
  id: string;
  user: {
    id: string;
    userid: string;
    firstName: string;
    lastName: string;
    email: string;
    status: string;
    emailVerified: boolean;
    createdAt: string;
  };
  professionalType: string;
  licenseNumber: string;
  specialization: string;
  yearsOfExperience: number;
  phone: string;
  isVerified: boolean;
  isAvailable: boolean;
  averageRating: number;
  totalReviews: number;
  totalAppointments: number;
  completedAppointments: number;
  createdAt: string;
  // Optional fields
  licenseExpiryDate?: string;
  bio?: string;
  qualifications?: any[];
  certifications?: any[];
  skills?: string[];
  // Legacy fields for backward compatibility
  user_id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  professional_type?: string;
  license_number?: string;
  license_expiry_date?: string;
  verification_status?: 'pending' | 'verified' | 'rejected';
  is_active?: boolean;
  email_verified?: boolean;
  created_at?: string;
  experience_years?: number;
  statistics?: {
    total_applications: number;
    total_earnings: number;
    total_appointments: number;
  };
}

export interface ProfessionalListParams {
  page?: number;
  page_size?: number;
  search?: string;
  professional_type?: string;
  verification_status?: 'pending' | 'verified' | 'rejected' | '';
}

export interface ProfessionalService {
  id: number;
  service_name: string;
  description: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
}

export interface ProfessionalApplication {
  id: number;
  hospital_name: string;
  position: string;
  status: string;
  applied_date: string;
  updated_at: string;
}

export interface ProfessionalSchedule {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  appointment_id?: number;
  appointment_status?: string;
}

export interface ProfessionalEarning {
  id: number;
  amount: number;
  source: string;
  status: 'pending' | 'completed';
  date: string;
  description: string;
}

export interface ProfessionalDocument {
  id: number;
  document_type: string;
  document_url: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  uploaded_at: string;
  verified_at?: string;
  rejection_reason?: string;
}

export interface VerificationAction {
  professional_id: number;
  action: 'approve' | 'reject';
  reason?: string;
}
