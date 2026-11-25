/**
 * Payment validation rules
 *
 * CRITICAL RULES (enforced on backend, reflected here for UI feedback):
 * 1. Never trust the amount from the frontend — amount comes from DB plan
 * 2. Never activate a subscription from frontend alone — wait for backend verify
 * 3. Every transaction must be verified with Paystack on the backend
 * 4. Prevent duplicate payment processing (idempotency)
 */
import { ValidationResult } from './authValidation';

export const validatePaymentReference = (ref: string): ValidationResult => {
  if (!ref?.trim()) return { valid: false, message: 'Payment reference is required' };
  // References are generated server-side; client should not modify them
  return { valid: true, message: '' };
};

export const validateTransactionStatus = (status: string): ValidationResult => {
  const VALID = ['success', 'failed', 'pending', 'abandoned'];
  if (!status) return { valid: false, message: 'Transaction status is required' };
  if (!VALID.includes(status.toLowerCase()))
    return { valid: false, message: 'Invalid transaction status' };
  return { valid: true, message: '' };
};

/** Check that a subscription is genuinely active (use after backend verification) */
export const validateActiveSubscription = (subscription: any): ValidationResult => {
  if (!subscription) return { valid: false, message: 'No active subscription found' };
  if (subscription.status !== 'active')
    return { valid: false, message: 'Subscription is not active' };
  if (subscription.paymentStatus !== 'completed')
    return { valid: false, message: 'Payment has not been confirmed' };
  if (new Date(subscription.endDate) < new Date())
    return { valid: false, message: 'Subscription has expired' };
  return { valid: true, message: '' };
};

export const validateVacancyPostingPayment = (amount: number): ValidationResult => {
  if (!amount || amount <= 0)
    return { valid: false, message: 'Invalid payment amount for vacancy posting' };
  return { valid: true, message: '' };
};
