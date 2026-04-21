import { z } from 'zod';

// Common validation patterns
const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

// Registration Schema
export const registrationSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters'),
  email: z.string()
    .email('Please enter a valid email address'),
  phone: z.string()
    .regex(phoneRegex, 'Please enter a valid phone number'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(passwordRegex, 'Password must contain uppercase, lowercase, and number'),
  confirmPassword: z.string(),
  dateOfBirth: z.string()
    .refine((date) => {
      const dob = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      return age >= 18 && age <= 120;
    }, 'You must be at least 18 years old'),
  gender: z.string().refine((val) => ['male', 'female', 'other'].includes(val), {
    message: 'Gender must be male, female, or other'
  }),
  address: z.string()
    .min(10, 'Address must be at least 10 characters')
    .max(200, 'Address must not exceed 200 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;

// Login Schema
export const loginSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address'),
  password: z.string()
    .min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Reset Password Schema
export const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(passwordRegex, 'Password must contain uppercase, lowercase, and number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Profile Update Schema
export const profileUpdateSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters'),
  phone: z.string()
    .regex(phoneRegex, 'Please enter a valid phone number'),
  address: z.string()
    .min(10, 'Address must be at least 10 characters')
    .max(200, 'Address must not exceed 200 characters'),
  emergencyContactName: z.string()
    .min(2, 'Emergency contact name must be at least 2 characters'),
  emergencyContactPhone: z.string()
    .regex(phoneRegex, 'Please enter a valid phone number'),
  emergencyContactRelationship: z.string()
    .min(2, 'Relationship must be at least 2 characters'),
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

// Password Change Schema
export const passwordChangeSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(passwordRegex, 'Password must contain uppercase, lowercase, and number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword'],
});

export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

// Booking Schema
export const bookingSchema = z.object({
  providerId: z.string()
    .min(1, 'Please select a provider'),
  timeSlotId: z.string()
    .min(1, 'Please select a time slot'),
  consultationType: z.string().refine((val) => ['video', 'chat', 'in-person'].includes(val), {
    message: 'Consultation type must be video, chat, or in-person'
  }),
  reason: z.string()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason must not exceed 500 characters'),
  notes: z.string()
    .max(1000, 'Notes must not exceed 1000 characters')
    .optional(),
});

export type BookingFormData = z.infer<typeof bookingSchema>;

// Emergency Booking Schema
export const emergencyBookingSchema = z.object({
  patientLocation: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string().min(1, 'Current location is required'),
  }),
  destination: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string().min(1, 'Destination is required'),
  }),
  emergencyType: z.string()
    .min(1, 'Please select emergency type'),
  patientCondition: z.string()
    .min(10, 'Please describe patient condition (at least 10 characters)')
    .max(500, 'Description must not exceed 500 characters'),
  contactNumber: z.string()
    .regex(phoneRegex, 'Please enter a valid contact number'),
});

export type EmergencyBookingFormData = z.infer<typeof emergencyBookingSchema>;

// Feedback Schema
export const feedbackSchema = z.object({
  appointmentId: z.string()
    .min(1, 'Appointment ID is required'),
  rating: z.number()
    .min(1, 'Please provide a rating')
    .max(5, 'Rating must be between 1 and 5'),
  review: z.string()
    .min(10, 'Review must be at least 10 characters')
    .max(1000, 'Review must not exceed 1000 characters'),
  categories: z.array(z.string())
    .min(1, 'Please select at least one category'),
});

export type FeedbackFormData = z.infer<typeof feedbackSchema>;

// Payment Schema
export const paymentSchema = z.object({
  amount: z.number()
    .positive('Amount must be positive'),
  paymentMethod: z.string().refine((val) => ['card', 'bank_transfer', 'mobile_money'].includes(val), {
    message: 'Payment method must be card, bank_transfer, or mobile_money'
  }),
  cardNumber: z.string()
    .optional()
    .refine((val) => !val || /^\d{16}$/.test(val.replace(/\s/g, '')), {
      message: 'Card number must be 16 digits',
    }),
  cardExpiry: z.string()
    .optional()
    .refine((val) => !val || /^(0[1-9]|1[0-2])\/\d{2}$/.test(val), {
      message: 'Expiry must be in MM/YY format',
    }),
  cardCvv: z.string()
    .optional()
    .refine((val) => !val || /^\d{3,4}$/.test(val), {
      message: 'CVV must be 3 or 4 digits',
    }),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

// Notification Preferences Schema
export const notificationPreferencesSchema = z.object({
  email: z.boolean(),
  sms: z.boolean(),
  inApp: z.boolean(),
  appointmentReminders: z.boolean(),
  promotions: z.boolean(),
});

export type NotificationPreferencesFormData = z.infer<typeof notificationPreferencesSchema>;
