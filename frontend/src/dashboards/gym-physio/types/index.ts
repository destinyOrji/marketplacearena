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
  cancelledBookings?: number;
  totalRevenue?: number;
  subscription?: {
    plan: 'basic' | 'professional' | 'premium' | 'none';
    status: 'active' | 'expired' | 'cancelled' | 'none';
    startDate?: Date;
    endDate?: Date;
    amount?: number;
    transactionReference?: string;
  };
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
  subcategory?: string;
  price: number;
  duration: number;
  status: 'active' | 'inactive' | 'draft';
  images: string[];
  tags: string[];
  features?: string[];
  requirements?: string;
  availability: string;
  rating: number;
  reviewCount: number;
  bookingCount: number;
  averageRating?: number;
  completionRate?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  _id?: string;
  date: Date;
  scheduledDate?: Date;
  time: string;
  scheduledTime?: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  type: 'in-person' | 'video_call' | 'phone_call' | 'video' | 'in_person';
  appointmentMode?: string;
  client?: {
    _id?: string;
    user?: {
      _id?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
    };
    phone?: string;
  };
  patient?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    photo?: string;
  };
  service?: {
    id: string;
    _id?: string;
    title: string;
    price: number;
    images?: string[];
  };
  payment?: {
    amount: number;
    status: 'pending' | 'completed' | 'refunded' | 'paid';
  };
  paymentStatus?: string;
  consultationFee?: number;
  reason?: string;
  reasonForVisit?: string;
  notes?: string;
  clientNotes?: string;
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
