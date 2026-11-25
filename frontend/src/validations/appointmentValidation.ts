/**
 * Appointment validation rules
 */
import { ValidationResult } from './authValidation';

export const validateAppointmentDate = (dateStr: string): ValidationResult => {
  if (!dateStr) return { valid: false, message: 'Appointment date is required' };
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { valid: false, message: 'Invalid appointment date' };
  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (d < today) return { valid: false, message: 'Cannot book an appointment in the past' };
  // Don't allow more than 1 year in advance
  const maxDate = new Date(); maxDate.setFullYear(maxDate.getFullYear() + 1);
  if (d > maxDate) return { valid: false, message: 'Appointment date is too far in the future' };
  return { valid: true, message: '' };
};

export const validateAppointmentTime = (time: string): ValidationResult => {
  if (!time) return { valid: false, message: 'Appointment time is required' };
  if (!/^\d{2}:\d{2}$/.test(time)) return { valid: false, message: 'Time must be in HH:MM format' };
  const [h, m] = time.split(':').map(Number);
  if (h < 0 || h > 23 || m < 0 || m > 59)
    return { valid: false, message: 'Invalid time value' };
  return { valid: true, message: '' };
};

export const validateProvider = (
  professionalId?: string, gymPhysioId?: string, hospitalId?: string
): ValidationResult => {
  if (!professionalId && !gymPhysioId && !hospitalId)
    return { valid: false, message: 'A provider must be selected' };
  return { valid: true, message: '' };
};

export const validateAppointmentMode = (mode: string): ValidationResult => {
  const allowed = ['in_person', 'video_call', 'phone_call'];
  if (!mode) return { valid: false, message: 'Appointment mode is required' };
  if (!allowed.includes(mode))
    return { valid: false, message: `Mode must be one of: ${allowed.join(', ')}` };
  return { valid: true, message: '' };
};

export const validateReasonForVisit = (reason: string): ValidationResult => {
  if (!reason?.trim()) return { valid: false, message: 'Reason for visit is required' };
  if (reason.trim().length > 500) return { valid: false, message: 'Reason must be under 500 characters' };
  return { valid: true, message: '' };
};
