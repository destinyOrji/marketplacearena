// User and Authentication Types
export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  address: string;
  profilePhoto?: string;
  emergencyContact: EmergencyContact;
  createdAt: Date;
  verified: boolean;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// Service Provider Types
export interface ServiceProvider {
  id: string;
  name: string;
  type: 'doctor' | 'hospital' | 'ambulance';
  specialty?: string;
  location: string;
  rating: number;
  reviewCount: number;
  availability: boolean;
  photo: string;
  images?: string[]; // Add images array
  price?: number;
}

export interface FilterOptions {
  type: string[];
  specialty: string[];
  location: string;
  minRating: number;
  availability: boolean;
}

// Appointment Types
export interface TimeSlot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface BookingData {
  providerId: string;
  timeSlotId: string;
  consultationType: 'video' | 'chat' | 'in-person';
  reason: string;
  notes?: string;
}

export interface Appointment {
  id: string;
  provider: ServiceProvider;
  date: Date;
  time: string;
  type: 'video' | 'chat' | 'in-person';
  status: 'upcoming' | 'completed' | 'cancelled';
  consultationLink?: string;
}

// Emergency Service Types
export interface EmergencyBooking {
  patientLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  destination: {
    latitude: number;
    longitude: number;
    address: string;
  };
  emergencyType: string;
  patientCondition: string;
  contactNumber: string;
}

export interface AmbulanceService {
  id: string;
  name: string;
  vehicleNumber: string;
  distance: number;
  estimatedArrival: number; // minutes
  rating: number;
  price: number;
}

// Medical Records Types
export interface MedicalRecord {
  id: string;
  date: Date;
  provider: string;
  diagnosis: string;
  prescription: Prescription[];
  notes: string;
  attachments: string[];
}

export interface Prescription {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

// Payment Types
export interface Payment {
  id: string;
  date: Date;
  service: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  method: string;
  receiptUrl?: string;
}

export interface PaymentMethod {
  type: 'card' | 'bank_transfer' | 'mobile_money';
  details: any;
}

// Feedback Types
export interface FeedbackSubmission {
  appointmentId: string;
  rating: number; // 1-5
  review: string;
  categories: string[]; // e.g., 'professionalism', 'communication'
}

export interface FeedbackHistory {
  id: string;
  date: Date;
  provider: string;
  rating: number;
  review: string;
  editable: boolean;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'appointment' | 'payment' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  inApp: boolean;
  appointmentReminders: boolean;
  promotions: boolean;
}

// Profile Types
export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  gender: string;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  photo?: string;
}

// Error Types
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

// API Response Types
export interface ApiResponse<T> {
  statuscode: number;
  status: 'success' | 'error';
  message: string;
  data: T;
  errors?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
