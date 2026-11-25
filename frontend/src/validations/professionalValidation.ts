/**
 * Healthcare Professional validation rules
 */
import { ValidationResult } from './authValidation';

export const PROFESSIONAL_TYPES = [
  'doctor', 'nurse', 'technician', 'therapist',
  'pharmacist', 'physiotherapist', 'other',
];

export const validateProfessionalType = (type: string): ValidationResult => {
  if (!type) return { valid: false, message: 'Professional type is required' };
  if (!PROFESSIONAL_TYPES.includes(type.toLowerCase()))
    return { valid: false, message: `Invalid professional type. Must be one of: ${PROFESSIONAL_TYPES.join(', ')}` };
  return { valid: true, message: '' };
};

export const validateSpecialization = (val: string): ValidationResult => {
  if (!val?.trim()) return { valid: false, message: 'Specialization is required' };
  return { valid: true, message: '' };
};

export const validateLicenseNumber = (val: string): ValidationResult => {
  if (!val?.trim()) return { valid: false, message: 'Licence number is required' };
  return { valid: true, message: '' };
};

export const validateYearsOfExperience = (years: number): ValidationResult => {
  if (years < 0) return { valid: false, message: 'Years of experience cannot be negative' };
  if (years > 60) return { valid: false, message: 'Years of experience seems too high' };
  return { valid: true, message: '' };
};

export const validateBio = (bio: string, maxLength = 1000): ValidationResult => {
  if (bio && bio.length > maxLength)
    return { valid: false, message: `Bio must be under ${maxLength} characters` };
  return { valid: true, message: '' };
};

export const validateServicePrice = (price: number): ValidationResult => {
  if (price === undefined || price === null) return { valid: false, message: 'Price is required' };
  if (price <= 0) return { valid: false, message: 'Price must be greater than 0' };
  return { valid: true, message: '' };
};

export const validateServiceDuration = (duration: number): ValidationResult => {
  if (!duration) return { valid: false, message: 'Duration is required' };
  if (duration < 15) return { valid: false, message: 'Duration must be at least 15 minutes' };
  return { valid: true, message: '' };
};

export const validateConsultationFee = (fee: number): ValidationResult => {
  if (fee < 0) return { valid: false, message: 'Consultation fee cannot be negative' };
  return { valid: true, message: '' };
};

export const validateDocumentFile = (file: File): ValidationResult => {
  const MAX = 10 * 1024 * 1024; // 10 MB
  const ALLOWED = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
  if (file.size > MAX) return { valid: false, message: 'Document must be under 10 MB' };
  if (!ALLOWED.includes(file.type))
    return { valid: false, message: 'Only PDF or image files are accepted' };
  return { valid: true, message: '' };
};
