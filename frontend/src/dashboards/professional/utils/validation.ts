// Validation utilities using Zod

import { z } from 'zod';

// Profile validation schema
export const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100, 'Full name is too long'),
  phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number format').min(10, 'Phone number is too short'),
  licenseNumber: z.string().min(3, 'License number is required').max(50, 'License number is too long'),
  yearsOfExperience: z.number().min(0, 'Years of experience must be 0 or greater').max(70, 'Invalid years of experience'),
  specialization: z.array(z.string()).min(1, 'At least one specialization is required'),
  bio: z.string().max(1000, 'Bio must be less than 1000 characters').optional(),
  languages: z.array(z.string()).optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// Service validation schema
export const serviceSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title is too long'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(1000, 'Description is too long'),
  category: z.string().min(1, 'Category is required'),
  price: z.number().min(0, 'Price must be 0 or greater'),
  duration: z.number().min(15, 'Duration must be at least 15 minutes').max(480, 'Duration cannot exceed 8 hours'),
  consultationType: z.array(z.string().refine((val) => ['in-person', 'virtual', 'home-visit'].includes(val), {
    message: 'Consultation type must be in-person, virtual, or home-visit'
  })).min(1, 'At least one consultation type is required'),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;

// Job application validation schema
export const jobApplicationSchema = z.object({
  coverLetter: z.string().min(50, 'Cover letter must be at least 50 characters').max(2000, 'Cover letter is too long'),
});

export type JobApplicationFormData = z.infer<typeof jobApplicationSchema>;

// Settings validation schema
export const settingsSchema = z.object({
  notifications: z.object({
    email: z.boolean(),
    sms: z.boolean(),
    inApp: z.boolean(),
    jobAlerts: z.boolean(),
  }),
  privacy: z.object({
    profileVisibility: z.string().refine((val) => ['public', 'private'].includes(val), {
      message: 'Profile visibility must be public or private'
    }),
    showRatings: z.boolean(),
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
