/**
 * TypeScript types and interfaces for Hospital Dashboard
 */

export interface Hospital {
  hospital_id: number;
  user_email: string;
  hospital_name: string;
  registration_number: string;
  facility_type: 'public' | 'private' | 'clinic' | 'specialty' | 'teaching';
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  phone: string;
  email: string;
  website?: string;
  number_of_beds: number;
  specializations: string[];
  certifications: string[];
  operating_hours: OperatingHours;
  description: string;
  logo?: string;
  images: string[];
  verification_status: 'pending' | 'verified' | 'rejected';
  onboarding_completed: boolean;
  is_active: boolean;
  active_vacancies_count: number;
  total_applications_count: number;
  created_at: string;
  updated_at: string;
}

export interface OperatingHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  open: string;
  close: string;
  is_closed?: boolean;
}

export interface Vacancy {
  vacancy_id: number;
  hospital_name: string;
  hospital_city?: string;
  hospital_state?: string;
  job_title: string;
  department: string;
  job_description: string;
  required_qualifications: string[];
  experience_level: 'entry' | 'mid' | 'senior' | 'expert';
  minimum_experience_years: number;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'temporary';
  salary_range_min?: number;
  salary_range_max?: number;
  salary_currency: string;
  benefits: string[];
  number_of_positions: number;
  application_deadline: string;
  status: 'draft' | 'active' | 'paused' | 'closed' | 'filled';
  published_at?: string;
  views_count: number;
  applications_count: number;
  is_expired?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Application {
  application_id: number;
  professional_name: string;
  professional_type: string;
  vacancy_title: string;
  hospital_name: string;
  application_status: 'pending' | 'reviewed' | 'shortlisted' | 'offered' | 'accepted' | 'rejected' | 'withdrawn';
  applied_at: string;
  reviewed_at?: string;
  cover_letter?: string;
  resume_file?: string;
  additional_documents?: string[];
  review_notes?: string;
  offer_details?: JobOffer;
  offer_sent_at?: string;
  offer_response_at?: string;
}

export interface ApplicationDetail extends Application {
  professional: Professional;
  vacancy_title: string;
  vacancy_department: string;
  reviewer_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Professional {
  professional_id: number;
  user_name: string;
  user_email: string;
  professional_type: string;
  specialization: string;
  years_of_experience: number;
  license_number: string;
  qualifications: string[];
  certifications: string[];
  skills: string[];
}

export interface JobOffer {
  position_title: string;
  salary_offered: number;
  currency: string;
  start_date: string;
  employment_type: string;
  benefits: string[];
  additional_terms?: string;
  offer_expiry_date: string;
}

export interface Payment {
  payment_id: number;
  hospital_name: string;
  invoice_number: string;
  transaction_id: string;
  payment_type: 'subscription' | 'job_posting' | 'featured_listing' | 'premium_feature';
  amount: number;
  currency: string;
  payment_method: 'credit_card' | 'debit_card' | 'bank_transfer' | 'wallet';
  payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  description: string;
  invoice_url?: string;
  initiated_at: string;
  completed_at?: string;
}

export interface Subscription {
  subscription_id: number;
  hospital_name: string;
  plan_type: 'free' | 'basic' | 'premium' | 'enterprise';
  plan_name: string;
  monthly_fee: number;
  job_posting_limit?: number;
  featured_listings_limit: number;
  features: Record<string, boolean>;
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  status: 'active' | 'expired' | 'cancelled' | 'suspended';
  is_active: boolean;
  is_expired: boolean;
  remaining_job_posts?: number;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  hospital_id: number;
  hospital_name: string;
  verification_status: string;
  onboarding_completed: boolean;
  active_vacancies: number;
  total_vacancies: number;
  total_applications: number;
  pending_applications: number;
  recent_applications: Application[];
}

export interface VacancyStats {
  vacancy_id: number;
  job_title: string;
  total_applications: number;
  pending_applications: number;
  reviewed_applications: number;
  shortlisted_applications: number;
  offered_applications: number;
  accepted_applications: number;
  rejected_applications: number;
  views_count: number;
  days_remaining: number;
}

export interface PaginationMeta {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
}

export interface ApiResponse<T> {
  statuscode: number;
  status: 'success' | 'error';
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}
