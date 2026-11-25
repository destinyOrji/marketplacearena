/**
 * Hospital validation rules
 */
import { ValidationResult } from './authValidation';

export const HOSPITAL_TYPES = [
  'General Hospital', 'Specialist Hospital', 'Teaching Hospital',
  'Private Hospital', 'Clinic', 'Medical Center',
];

export const validateHospitalName = (name: string): ValidationResult => {
  if (!name?.trim()) return { valid: false, message: 'Hospital name is required' };
  if (name.trim().length < 3) return { valid: false, message: 'Hospital name must be at least 3 characters' };
  return { valid: true, message: '' };
};

export const validateHospitalType = (type: string): ValidationResult => {
  if (!type) return { valid: false, message: 'Hospital type is required' };
  if (!HOSPITAL_TYPES.includes(type))
    return { valid: false, message: `Invalid hospital type. Must be one of: ${HOSPITAL_TYPES.join(', ')}` };
  return { valid: true, message: '' };
};

export const validateBedCounts = (
  total: number, available: number, icu: number
): Record<string, string> => {
  const errors: Record<string, string> = {};
  if (total < 0)     errors.totalBeds     = 'Total beds cannot be negative';
  if (available < 0) errors.availableBeds = 'Available beds cannot be negative';
  if (icu < 0)       errors.icuBeds       = 'ICU beds cannot be negative';
  if (available > total) errors.availableBeds = 'Available beds cannot exceed total beds';
  if (icu > total)       errors.icuBeds       = 'ICU beds cannot exceed total beds';
  return errors;
};

export const validateWebsiteUrl = (url: string): ValidationResult => {
  if (!url) return { valid: true, message: '' }; // optional
  if (!/^https?:\/\/.+/.test(url))
    return { valid: false, message: 'Website must start with http:// or https://' };
  return { valid: true, message: '' };
};

export const validateNoEmptyTags = (tags: string[], label: string): ValidationResult => {
  if (tags.some(t => !t.trim()))
    return { valid: false, message: `${label} cannot contain empty entries` };
  const unique = new Set(tags.map(t => t.toLowerCase()));
  if (unique.size < tags.length)
    return { valid: false, message: `${label} cannot contain duplicates` };
  return { valid: true, message: '' };
};

export const validateLogoFile = (file: File): ValidationResult => {
  const MAX = 5 * 1024 * 1024;
  const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
  if (file.size > MAX) return { valid: false, message: 'Logo must be under 5 MB' };
  if (!ALLOWED.includes(file.type))
    return { valid: false, message: 'Logo must be JPG, PNG or WebP' };
  return { valid: true, message: '' };
};
