/**
 * Hospital Management Type Definitions
 */

export interface Hospital {
  id: string;
  user_id: string;
  hospital_name: string;
  email: string;
  phone: string;
  facility_type: string;
  registration_number: string;
  address: string;
  city: string;
  state: string;
  country: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  description?: string;
  website?: string;
  statistics?: {
    total_vacancies: number;
    total_applications: number;
    active_professionals: number;
  };
}

export interface HospitalListParams {
  page?: number;
  page_size?: number;
  search?: string;
  facility_type?: string;
  verification_status?: 'pending' | 'verified' | 'rejected' | '';
}

export interface HospitalVacancy {
  id: string;
  position: string;
  department: string;
  description: string;
  requirements: string;
  salary_range: string;
  employment_type: string;
  status: 'active' | 'inactive' | 'closed';
  application_count: number;
  posted_date: string;
  closing_date?: string;
}

export interface HospitalApplication {
  id: string;
  vacancy_id: string;
  vacancy_title: string;
  professional_name: string;
  professional_email: string;
  professional_type: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  applied_date: string;
  updated_at: string;
}

export interface HospitalSubscription {
  id: string;
  plan_name: string;
  plan_type: string;
  amount: number;
  billing_cycle: string;
  status: 'active' | 'expired' | 'cancelled';
  start_date: string;
  end_date: string;
  next_billing_date?: string;
  payment_history: PaymentHistory[];
}

export interface PaymentHistory {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: 'completed' | 'pending' | 'failed';
  invoice_url?: string;
}

export interface HospitalDocument {
  id: string;
  document_type: string;
  document_url: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  uploaded_at: string;
  verified_at?: string;
  rejection_reason?: string;
}
