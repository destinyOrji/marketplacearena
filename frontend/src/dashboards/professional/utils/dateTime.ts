// Date and time utility functions

import { format, parseISO, isValid, differenceInDays, differenceInHours, formatDistanceToNow as dateFnsFormatDistanceToNow } from 'date-fns';

/**
 * Format a date to a readable string
 */
export const formatDate = (date: Date | string, formatString: string = 'MMM dd, yyyy'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj) ? format(dateObj, formatString) : 'Invalid date';
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Format a date and time
 */
export const formatDateTime = (date: Date | string): string => {
  return formatDate(date, 'MMM dd, yyyy hh:mm a');
};

/**
 * Format time only
 */
export const formatTime = (date: Date | string): string => {
  return formatDate(date, 'hh:mm a');
};

/**
 * Get relative time string (e.g., "2 hours ago", "in 3 days")
 */
export const getRelativeTime = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const now = new Date();
    const daysDiff = differenceInDays(dateObj, now);
    const hoursDiff = differenceInHours(dateObj, now);

    if (Math.abs(daysDiff) === 0) {
      if (Math.abs(hoursDiff) === 0) {
        return 'Just now';
      } else if (hoursDiff > 0) {
        return `in ${hoursDiff} hour${hoursDiff > 1 ? 's' : ''}`;
      } else {
        return `${Math.abs(hoursDiff)} hour${Math.abs(hoursDiff) > 1 ? 's' : ''} ago`;
      }
    } else if (daysDiff > 0) {
      return `in ${daysDiff} day${daysDiff > 1 ? 's' : ''}`;
    } else {
      return `${Math.abs(daysDiff)} day${Math.abs(daysDiff) > 1 ? 's' : ''} ago`;
    }
  } catch (error) {
    return 'Unknown';
  }
};

/**
 * Check if a date is in the past
 */
export const isPastDate = (date: Date | string): boolean => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return dateObj < new Date();
  } catch (error) {
    return false;
  }
};

/**
 * Check if a date is within 24 hours
 */
export const isWithin24Hours = (date: Date | string): boolean => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const hoursDiff = differenceInHours(dateObj, new Date());
    return hoursDiff >= 0 && hoursDiff <= 24;
  } catch (error) {
    return false;
  }
};

/**
 * Format distance to now (e.g., "2 hours ago", "3 days ago")
 */
export const formatDistanceToNow = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return dateFnsFormatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    return 'Unknown';
  }
};
