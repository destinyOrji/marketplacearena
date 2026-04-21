// Date and time utility functions

import { format, formatDistanceToNow, differenceInMinutes, differenceInHours } from 'date-fns';

/**
 * Format date to readable string
 */
export const formatDate = (date: Date | string, formatStr: string = 'MMM dd, yyyy'): string => {
  return format(new Date(date), formatStr);
};

/**
 * Format time to readable string
 */
export const formatTime = (date: Date | string): string => {
  return format(new Date(date), 'hh:mm a');
};

/**
 * Format date and time together
 */
export const formatDateTime = (date: Date | string): string => {
  return format(new Date(date), 'MMM dd, yyyy hh:mm a');
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (date: Date | string): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

/**
 * Calculate time difference in minutes
 */
export const getMinutesDifference = (start: Date | string, end: Date | string): number => {
  return differenceInMinutes(new Date(end), new Date(start));
};

/**
 * Calculate time difference in hours
 */
export const getHoursDifference = (start: Date | string, end: Date | string): number => {
  return differenceInHours(new Date(end), new Date(start));
};

/**
 * Check if date is within next N hours
 */
export const isWithinHours = (date: Date | string, hours: number): boolean => {
  const now = new Date();
  const target = new Date(date);
  const diffHours = (target.getTime() - now.getTime()) / (1000 * 60 * 60);
  return diffHours > 0 && diffHours <= hours;
};
