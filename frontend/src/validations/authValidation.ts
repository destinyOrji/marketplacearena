/**
 * Auth validation rules (mirrors backend validatePassword + field rules)
 */

export interface ValidationResult {
  valid: boolean;
  message: string;
}

export const validateEmail = (email: string): ValidationResult => {
  if (!email?.trim()) return { valid: false, message: 'Email is required' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return { valid: false, message: 'Enter a valid email address' };
  return { valid: true, message: '' };
};

export const validatePhone = (phone: string): ValidationResult => {
  if (!phone?.trim()) return { valid: false, message: 'Phone number is required' };
  if (!/^\+?[0-9\s\-()]{7,15}$/.test(phone.trim()))
    return { valid: false, message: 'Enter a valid phone number (e.g. +234 800 000 0000)' };
  return { valid: true, message: '' };
};

export const validateName = (name: string, label = 'Name'): ValidationResult => {
  if (!name?.trim()) return { valid: false, message: `${label} is required` };
  if (name.trim().length < 2) return { valid: false, message: `${label} must be at least 2 characters` };
  if (!/^[a-zA-Z\s'\-\.]+$/.test(name.trim()))
    return { valid: false, message: `${label} can only contain letters, spaces, hyphens and apostrophes` };
  return { valid: true, message: '' };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password) return { valid: false, message: 'Password is required' };
  if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters' };
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Password must contain at least one uppercase letter' };
  if (!/[a-z]/.test(password)) return { valid: false, message: 'Password must contain at least one lowercase letter' };
  if (!/[0-9]/.test(password)) return { valid: false, message: 'Password must contain at least one number' };
  if (!/[^A-Za-z0-9]/.test(password)) return { valid: false, message: 'Password must contain at least one special character' };
  return { valid: true, message: '' };
};

export const validateConfirmPassword = (password: string, confirm: string): ValidationResult => {
  if (!confirm) return { valid: false, message: 'Please confirm your password' };
  if (password !== confirm) return { valid: false, message: 'Passwords do not match' };
  return { valid: true, message: '' };
};

export const validateOTP = (otp: string): ValidationResult => {
  if (!otp?.trim()) return { valid: false, message: 'Verification code is required' };
  if (!/^\d{6}$/.test(otp.trim())) return { valid: false, message: 'Verification code must be exactly 6 digits' };
  return { valid: true, message: '' };
};

/** Run multiple validators and return the first failure, or success */
export const runValidations = (checks: ValidationResult[]): ValidationResult => {
  for (const check of checks) {
    if (!check.valid) return check;
  }
  return { valid: true, message: '' };
};
