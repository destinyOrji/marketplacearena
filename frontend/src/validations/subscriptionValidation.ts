/**
 * Subscription / Plan validation rules
 */
import { ValidationResult } from './authValidation';

export const BILLING_INTERVALS = ['monthly', '6-months', 'yearly', 'one_time'];
export const ELIGIBILITY_OPTIONS = ['all', 'client', 'professional', 'hospital', 'ambulance', 'gym-physio'];

export const validatePlanName = (name: string): ValidationResult => {
  if (!name?.trim()) return { valid: false, message: 'Plan name is required' };
  if (name.trim().length < 3) return { valid: false, message: 'Plan name must be at least 3 characters' };
  return { valid: true, message: '' };
};

export const validatePlanPrice = (price: number, isFree = false): ValidationResult => {
  if (isFree) return { valid: true, message: '' };
  if (price === undefined || price === null) return { valid: false, message: 'Price is required' };
  if (price < 0) return { valid: false, message: 'Price cannot be negative' };
  return { valid: true, message: '' };
};

export const validateBillingInterval = (interval: string): ValidationResult => {
  if (!interval) return { valid: false, message: 'Billing interval is required' };
  if (!BILLING_INTERVALS.includes(interval))
    return { valid: false, message: `Invalid billing interval` };
  return { valid: true, message: '' };
};

export const validateEligibility = (eligibility: string): ValidationResult => {
  if (!eligibility) return { valid: false, message: 'Eligibility is required' };
  if (!ELIGIBILITY_OPTIONS.includes(eligibility))
    return { valid: false, message: 'Invalid eligibility value' };
  return { valid: true, message: '' };
};

export const validateFeatureLimit = (limit: number, label: string): ValidationResult => {
  if (limit < -1) return { valid: false, message: `${label} must be -1 (unlimited) or a positive number` };
  return { valid: true, message: '' };
};
