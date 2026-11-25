/**
 * Gym & Physiotherapy Provider validation rules
 */
import { ValidationResult } from './authValidation';

export const BUSINESS_TYPES = ['gym', 'physiotherapy', 'both'];

export const validateBusinessName = (name: string): ValidationResult => {
  if (!name?.trim()) return { valid: false, message: 'Business name is required' };
  return { valid: true, message: '' };
};

export const validateBusinessType = (type: string): ValidationResult => {
  if (!type) return { valid: false, message: 'Business type is required' };
  if (!BUSINESS_TYPES.includes(type.toLowerCase()))
    return { valid: false, message: `Business type must be one of: ${BUSINESS_TYPES.join(', ')}` };
  return { valid: true, message: '' };
};

export const validateYearsInBusiness = (years: number): ValidationResult => {
  if (years < 0) return { valid: false, message: 'Years in business cannot be negative' };
  return { valid: true, message: '' };
};

export const validateGymServicePrice = (price: number): ValidationResult => {
  if (price === undefined || price === null) return { valid: false, message: 'Price is required' };
  if (price <= 0) return { valid: false, message: 'Price must be greater than 0' };
  return { valid: true, message: '' };
};

export const validateSessionDuration = (duration: number): ValidationResult => {
  if (!duration) return { valid: false, message: 'Duration is required' };
  if (duration < 15) return { valid: false, message: 'Session duration must be at least 15 minutes' };
  return { valid: true, message: '' };
};

export const validateFee = (fee: number, label = 'Fee'): ValidationResult => {
  if (fee < 0) return { valid: false, message: `${label} cannot be negative` };
  return { valid: true, message: '' };
};
