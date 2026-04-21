// Core type definitions for Emergency Services Dashboard

// ============================================================================
// Emergency Provider Types
// ============================================================================

export interface EmergencyProvider {
  id: string;
  organizationName: string;
  contactPerson: string;
  email: string;
  phone: string;
  emergencyPhone: string;
  profilePhoto?: string;
  serviceTypes: string[];
  yearsOfExperience: number;
  licenseNumber: string;
  insuranceNumber: string;
  rating: number;
  reviewCount: number;
  completionPercentage: number;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  isAvailable: boolean;
  createdAt: Date;
}

export interface EmergencyProviderProfile {
  id: string;
  organizationName: string;
  contactPerson: string;
  email: string;
  phone: string;
  emergencyPhone: string;
  profilePhoto?: string;
  serviceTypes: string[];
  yearsOfExperience: number;
  licenseNumber: string;
  insuranceNumber: string;
  certifications: Certification[];
  documents: Document[];
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

export interface Document {
  id: string;
  type: string;
  name: string;
  url: string;
  uploadedAt: Date;
}

// ============================================================================
// Emergency Service Types
// ============================================================================

export interface EmergencyService {
  id: string;
  name: string;
  description: string;
  serviceType: 'ambulance' | 'paramedic' | 'fire' | 'rescue' | 'medical-transport';
  coverageArea: CoverageArea[];
  vehicleType: string;
  equipmentList: string[];
  staffQualifications: string[];
  estimatedResponseTime: number;
  basePrice: number;
  pricePerKm: number;
  images: string[];
  status: 'active' | 'inactive';
  bookingCount: number;
}

export interface CoverageArea {
  id: string;
  name: string;
  coordinates: [number, number][];
  radius?: number;
}

// ============================================================================
// Emergency Booking Types
// ============================================================================

export interface PendingEmergencyBooking {
  id: string;
  emergencyType: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  location: {
    address: string;
    coordinates: [number, number];
  };
  distance: number;
  estimatedPayment: number;
  patientInfo: {
    age?: number;
    gender?: string;
    medicalCondition?: string;
  };
  expiresAt: Date;
}

export interface ActiveEmergency {
  id: string;
  bookingId: string;
  patient: {
    id: string;
    name: string;
    phone: string;
    photo?: string;
  };
  emergencyType: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  location: {
    address: string;
    coordinates: [number, number];
  };
  distance: number;
  estimatedArrival: Date;
  status: 'pending' | 'accepted' | 'en-route' | 'arrived' | 'transporting' | 'completed';
  acceptedAt?: Date;
  arrivedAt?: Date;
  completedAt?: Date;
  payment: {
    amount: number;
    status: 'pending' | 'completed';
  };
  notes?: string;
}

export interface EmergencyBooking {
  id: string;
  bookingDate: Date;
  patient: {
    name: string;
    phone: string;
  };
  emergencyType: string;
  location: string;
  distance: number;
  responseTime: number;
  status: 'completed' | 'cancelled';
  payment: {
    amount: number;
    status: 'completed' | 'failed';
  };
  rating?: number;
  feedback?: string;
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
  bookingId: string;
  patient: string;
  service: string;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

// ============================================================================
// Vehicle & Equipment Types
// ============================================================================

export interface Vehicle {
  id: string;
  type: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  capacity: number;
  status: 'available' | 'in-use' | 'maintenance';
  images: string[];
  lastMaintenance: Date;
  nextMaintenance: Date;
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  quantity: number;
  status: 'available' | 'in-use' | 'maintenance';
  lastInspection: Date;
  nextInspection: Date;
}

// ============================================================================
// Coverage Zone Types
// ============================================================================

export interface CoverageZone {
  id: string;
  name: string;
  serviceTypes: string[];
  boundaries: [number, number][];
  radius?: number;
  isActive: boolean;
}

// ============================================================================
// Notification Types
// ============================================================================

export interface Notification {
  id: string;
  type: 'emergency' | 'booking' | 'payment' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  data?: any;
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface DashboardStats {
  totalEarnings: number;
  pendingPayments: number;
  totalEmergencies: number;
  averageResponseTime: number;
  completionRate: number;
  averageRating: number;
}

export interface PerformanceMetrics {
  totalEmergencies: number;
  averageResponseTime: number;
  completionRate: number;
  averageRating: number;
  totalReviews: number;
  peakHours: { hour: number; count: number }[];
  emergencyTypeBreakdown: { type: string; count: number }[];
}

// ============================================================================
// Settings Types
// ============================================================================

export interface ProviderSettings {
  notifications: {
    push: boolean;
    sms: boolean;
    email: boolean;
    sound: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    showRatings: boolean;
  };
  emergency: {
    autoDeclineAfter: number;
    maxSimultaneousBookings: number;
  };
}

// ============================================================================
// Authentication Types
// ============================================================================

export interface AuthState {
  isAuthenticated: boolean;
  provider: EmergencyProvider | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// ============================================================================
// Real-time State Types
// ============================================================================

export interface RealtimeState {
  isConnected: boolean;
  activeEmergency: ActiveEmergency | null;
  pendingBookings: PendingEmergencyBooking[];
  notifications: Notification[];
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
  WEBSOCKET_ERROR = 'WEBSOCKET_ERROR',
}

export interface AppError {
  type: ErrorType;
  message: string;
  details?: any;
}

// ============================================================================
// Map Types
// ============================================================================

export interface MapMarker {
  id: string;
  position: [number, number];
  type: 'provider' | 'patient' | 'destination';
  label?: string;
}
