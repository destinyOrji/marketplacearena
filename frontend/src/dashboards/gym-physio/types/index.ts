// Type definitions for Gym & Physiotherapy Dashboard

export interface GymPhysioProfile {
  id: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  businessType: 'gym' | 'physiotherapy' | 'both';
  businessName: string;
  licenseNumber: string;
  specialization: string;
  yearsInBusiness: number;
  facilities: Facility[];
  certifications: Certification[];
  services: string[];
  bio?: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  licenseDocument?: string;
  businessRegistration?: string;
  profilePicture?: string;
  isVerified: boolean;
  verificationDate?: Date;
  isAvailable: boolean;
  membershipFee?: number;
  sessionFee?: number;
  currency: string;
  averageRating: number;
  totalReviews: number;
  totalBookings: number;
  completedBookings: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Facility {
  name: string;
  description?: string;
  images?: string[];
}

export interface Certification {
  name: string;
  issuingBody: string;
  issueDate: Date;
  expiryDate?: Date;
  certificateUrl?: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  duration: number;
  status: 'active' | 'inactive' | 'draft';
  images: string[];
  tags: string[];
  availability: string;
  rating: number;
  reviewCount: number;
  bookingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  date: Date;
  time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  type: 'in-person' | 'video';
  client: {
    id: string;
    name: string;
    email: string;
    photo?: string;
  };
  service?: {
    id: string;
    title: string;
    price: number;
  };
  payment: {
    amount: number;
    status: 'pending' | 'completed' | 'refunded';
  };
  reason?: string;
  notes?: string;
}

export interface Schedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isAvailable: boolean;
  timeSlots: TimeSlot[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface DashboardStats {
  totalEarnings: number;
  pendingPayments: number;
  upcomingAppointments: number;
  activeServices: number;
  completionRate: number;
  averageRating: number;
  totalReviews: number;
  totalBookings: number;
  completedBookings: number;
}

export interface NotificationContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
}
