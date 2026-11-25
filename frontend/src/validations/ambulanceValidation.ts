/**
 * Ambulance / Emergency Provider validation rules
 */
import { ValidationResult } from './authValidation';

export const SERVICE_TYPES = [
  'Basic Life Support (BLS)', 'Advanced Life Support (ALS)',
  'Critical Care Transport', 'Air Ambulance',
  'Non-Emergency Medical Transport', 'Patient Transport',
];

export const validateServiceName = (name: string): ValidationResult => {
  if (!name?.trim()) return { valid: false, message: 'Service name is required' };
  return { valid: true, message: '' };
};

export const validateServiceType = (type: string): ValidationResult => {
  if (!type) return { valid: false, message: 'Service type is required' };
  if (!SERVICE_TYPES.includes(type))
    return { valid: false, message: `Invalid service type` };
  return { valid: true, message: '' };
};

export const validateEmergencyNumber = (num: string): ValidationResult => {
  if (!num?.trim()) return { valid: false, message: 'Emergency number is required' };
  if (!/^\+?[0-9\s\-()]{7,15}$/.test(num.trim()))
    return { valid: false, message: 'Enter a valid emergency phone number' };
  return { valid: true, message: '' };
};

export const validateCoverageRadius = (radius: number): ValidationResult => {
  if (radius <= 0) return { valid: false, message: 'Coverage radius must be a positive number' };
  if (radius > 500) return { valid: false, message: 'Coverage radius seems too large (max 500 km)' };
  return { valid: true, message: '' };
};

export const validateResponseTime = (minutes: number): ValidationResult => {
  if (minutes < 0) return { valid: false, message: 'Response time cannot be negative' };
  return { valid: true, message: '' };
};
