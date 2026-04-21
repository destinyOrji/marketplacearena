// Core type definitions for Professional Dashboard

// ============================================================================
// Professional Types
// ============================================================================

export interface Professional {
  id: string;
  // API fields (from login response)
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  role?: string;
  emailVerified?: boolean;
  // Computed / display fields
  fullName: string;
  profilePhoto?: string;
  specialization: string[];
  yearsOfExperience: number;
  licenseNumber: string;
  rating: number;
  reviewCount: number;
  completionPercentage: number;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: Date;
}

export interface ProfessionalProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  profilePhoto?: string;
  specialization: string[];
  yearsOfExperience: number;
  licenseNumber: string;
  certifications: Certification[];
  education: Education[];
  bio: string;
  languages: string[];
  completionPercentage: number;
}

export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: Date;
  expiryDate?: Date;
  documentUrl: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  graduationYear: number;
  fieldOfStudy: string;
}

// ============================================================================
// Service Types
// ============================================================================

export interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  duration: number;
  consultationType: ('in-person' | 'virtual' | 'home-visit')[];
  images: string[];
  status: 'active' | 'inactive' | 'pending';
  bookingCount: number;
}

// ============================================================================
// Job Types
// ============================================================================

export interface JobPosting {
  id: string;
  title: string;
  description: string;
  specialty: string;
  location: string;
  jobType: 'full-time' | 'part-time' | 'contract' | 'per-diem';
  compensation: {
    type: 'hourly' | 'fixed' | 'negotiable';
    amount?: number;
  };
  postedDate: Date;
  applicationDeadline: Date;
  hasApplied: boolean;
}

export interface JobApplication {
  id: string;
  job: JobPosting;
  appliedDate: Date;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'offered' | 'accepted' | 'rejected';
  coverLetter: string;
  offer?: JobOffer;
}

export interface JobOffer {
  id: string;
  offeredDate: Date;
  responseDeadline: Date;
  finalCompensation: number;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

// ============================================================================
// Appointment Types
// ============================================================================

export interface Appointment {
  id: string;
  patient: {
    id: string;
    name: string;
    photo?: string;
  };
  service: Service;
  date: Date;
  time: string;
  type: 'video' | 'chat' | 'in-person' | 'home-visit';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  payment: {
    amount: number;
    status: 'pending' | 'completed';
  };
}

// ============================================================================
// Schedule Types
// ============================================================================

export interface WeeklySchedule {
  [key: string]: DaySchedule;
}

export interface DaySchedule {
  isAvailable: boolean;
  timeSlots: TimeSlot[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface BlockedDate {
  id: string;
  date: Date;
  reason: string;
}

// ============================================================================
// Payment Types
// ============================================================================

export interface EarningsSummary {
  totalEarnings: number;
  pendingPayments: number;
  completedPayments: number;
  platformFees: number;
  netEarnings: number;
}

export interface PaymentTransaction {
  id: string;
  date: Date;
  patient: string;
  service: string;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

// ============================================================================
// Notification Types
// ============================================================================

export interface Notification {
  id: string;
  type: 'job' | 'appointment' | 'payment' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface DashboardStats {
  totalEarnings: number;
  pendingPayments: number;
  upcomingAppointments: number;
  activeServices: number;
  completionRate: number;
  averageRating: number;
}

export interface PerformanceMetrics {
  totalAppointments: number;
  completionRate: number;
  averageRating: number;
  totalReviews: number;
  responseTime: number;
  popularServices: ServiceMetric[];
}

export interface ServiceMetric {
  serviceId: string;
  serviceName: string;
  bookings: number;
  revenue: number;
}

// ============================================================================
// Settings Types
// ============================================================================

export interface ProfessionalSettings {
  notifications: {
    email: boolean;
    sms: boolean;
    inApp: boolean;
    jobAlerts: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    showRatings: boolean;
  };
}

// ============================================================================
// Authentication Types
// ============================================================================

export interface AuthState {
  isAuthenticated: boolean;
  professional: Professional | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// ============================================================================
// Error Types
// ============================================================================

export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  NOT_FOUND = 'NOT_FOUND',
}

export interface AppError {
  type: ErrorType;
  message: string;
  details?: any;
}
