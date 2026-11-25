/**
 * Patient / Client validation rules
 */
import { ValidationResult } from './authValidation';

export const validateDateOfBirth = (dob: string): ValidationResult => {
  if (!dob) return { valid: true, message: '' }; // optional
  const d = new Date(dob);
  if (isNaN(d.getTime())) return { valid: false, message: 'Invalid date of birth' };
  if (d >= new Date()) return { valid: false, message: 'Date of birth cannot be in the future' };
  const age = (Date.now() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  if (age > 120) return { valid: false, message: 'Date of birth is not valid' };
  return { valid: true, message: '' };
};

export const validateGender = (gender: string): ValidationResult => {
  const allowed = ['male', 'female', 'other', 'prefer_not_to_say'];
  if (gender && !allowed.includes(gender.toLowerCase()))
    return { valid: false, message: 'Invalid gender selection' };
  return { valid: true, message: '' };
};

export const validateFeedbackRating = (rating: number): ValidationResult => {
  if (!rating && rating !== 0) return { valid: false, message: 'Rating is required' };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    return { valid: false, message: 'Rating must be between 1 and 5' };
  return { valid: true, message: '' };
};

export const validatePatientAppointmentDate = (dateStr: string): ValidationResult => {
  if (!dateStr) return { valid: false, message: 'Appointment date is required' };
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { valid: false, message: 'Invalid appointment date' };
  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (d < today) return { valid: false, message: 'Cannot book an appointment in the past' };
  return { valid: true, message: '' };
};

export const validateFileUpload = (
  file: File,
  maxMB = 5,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
): ValidationResult => {
  if (file.size > maxMB * 1024 * 1024)
    return { valid: false, message: `File must be under ${maxMB} MB` };
  if (!allowedTypes.includes(file.type))
    return { valid: false, message: `File type not allowed. Use: ${allowedTypes.join(', ')}` };
  return { valid: true, message: '' };
};
