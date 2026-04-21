// Validation utilities using Zod

import { z } from 'zod';

// Profile validation schema
export const profileSchema = z.object({
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
  contactPerson: z.string().min(2, 'Contact person name is required'),
  phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number format'),
  emergencyPhone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid emergency phone number format'),
  licenseNumber: z.string().min(3, 'License number is required'),
  insuranceNumber: z.string().min(3, 'Insurance number is required'),
  yearsOfExperience: z.number().min(0, 'Years of experience must be 0 or greater'),
  serviceTypes: z.array(z.string()).min(1, 'At least one service type is required'),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// Service validation schema
export const serviceSchema = z.object({
  name: z.string().min(5, 'Name must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  serviceType: z.string().refine((val) => ['ambulance', 'paramedic', 'fire', 'rescue', 'medical-transport'].includes(val), {
    message: 'Invalid service type'
  }),
  vehicleType: z.string().min(1, 'Vehicle type is required'),
  basePrice: z.number().min(0, 'Base price must be 0 or greater'),
  pricePerKm: z.number().min(0, 'Price per km must be 0 or greater'),
  estimatedResponseTime: z.number().min(1, 'Response time must be at least 1 minute'),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;

// Settings validation schema
export const settingsSchema = z.object({
  notifications: z.object({
    push: z.boolean(),
    sms: z.boolean(),
    email: z.boolean(),
    sound: z.boolean(),
  }),
  privacy: z.object({
    profileVisibility: z.string().refine((val) => ['public', 'private'].includes(val), {
      message: 'Profile visibility must be public or private'
    }),
    showRatings: z.boolean(),
  }),
  emergency: z.object({
    autoDeclineAfter: z.number().min(30).max(120),
    maxSimultaneousBookings: z.number().min(1).max(5),
  }),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;

// Password change validation schema
export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  ),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

// Helper function to format validation errors
export const formatValidationErrors = (error: z.ZodError): Record<string, string> => {
  const errors: Record<string, string> = {};
  error.issues.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  return errors;
};
