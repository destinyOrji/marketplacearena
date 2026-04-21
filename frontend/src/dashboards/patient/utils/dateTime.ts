import {
  format,
  formatDistance,
  formatRelative,
  isToday,
  isTomorrow,
  isYesterday,
  isPast,
  isFuture,
  addDays,
  addHours,
  addMinutes,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  parseISO,
  isValid,
} from 'date-fns';

/**
 * Format date for display
 */
export const formatDate = (date: Date | string, formatStr: string = 'MMM dd, yyyy'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return 'Invalid date';
  return format(dateObj, formatStr);
};

/**
 * Format time for display
 */
export const formatTime = (date: Date | string, formatStr: string = 'hh:mm a'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return 'Invalid time';
  return format(dateObj, formatStr);
};

/**
 * Format date and time for display
 */
export const formatDateTime = (date: Date | string, formatStr: string = 'MMM dd, yyyy hh:mm a'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return 'Invalid date';
  return format(dateObj, formatStr);
};

/**
 * Format date relative to now (e.g., "2 hours ago", "in 3 days")
 */
export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return 'Invalid date';
  return formatDistance(dateObj, new Date(), { addSuffix: true });
};

/**
 * Format date relative to now with context (e.g., "today at 3:00 PM")
 */
export const formatRelativeDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return 'Invalid date';
  return formatRelative(dateObj, new Date());
};

/**
 * Get friendly date label (Today, Tomorrow, Yesterday, or formatted date)
 */
export const getFriendlyDateLabel = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return 'Invalid date';
  
  if (isToday(dateObj)) return 'Today';
  if (isTomorrow(dateObj)) return 'Tomorrow';
  if (isYesterday(dateObj)) return 'Yesterday';
  
  return formatDate(dateObj, 'MMM dd, yyyy');
};

/**
 * Check if date is in the past
 */
export const isDatePast = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isValid(dateObj) && isPast(dateObj);
};

/**
 * Check if date is in the future
 */
export const isDateFuture = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isValid(dateObj) && isFuture(dateObj);
};

/**
 * Generate time slots for a given date
 */
export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  label: string;
  available: boolean;
}

export const generateTimeSlots = (
  date: Date,
  startHour: number = 9,
  endHour: number = 17,
  intervalMinutes: number = 30,
  unavailableSlots: string[] = []
): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const baseDate = startOfDay(date);
  
  let currentTime = addHours(baseDate, startHour);
  const endTime = addHours(baseDate, endHour);
  
  while (currentTime < endTime) {
    const slotEndTime = addMinutes(currentTime, intervalMinutes);
    const startTimeStr = format(currentTime, 'HH:mm');
    const endTimeStr = format(slotEndTime, 'HH:mm');
    const slotId = `${format(date, 'yyyy-MM-dd')}_${startTimeStr}`;
    
    slots.push({
      id: slotId,
      startTime: startTimeStr,
      endTime: endTimeStr,
      label: `${format(currentTime, 'hh:mm a')} - ${format(slotEndTime, 'hh:mm a')}`,
      available: !unavailableSlots.includes(slotId),
    });
    
    currentTime = slotEndTime;
  }
  
  return slots;
};

/**
 * Get available dates for the next N days
 */
export const getAvailableDates = (
  daysCount: number = 30,
  excludeWeekends: boolean = false
): Date[] => {
  const dates: Date[] = [];
  const today = startOfDay(new Date());
  
  for (let i = 0; i < daysCount; i++) {
    const date = addDays(today, i);
    
    if (excludeWeekends) {
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;
    }
    
    dates.push(date);
  }
  
  return dates;
};

/**
 * Get calendar weeks for a month
 */
export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
}

export const getCalendarWeeks = (date: Date): CalendarDay[][] => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const weeks: CalendarDay[][] = [];
  let currentWeek: CalendarDay[] = [];
  let currentDate = calendarStart;
  
  while (currentDate <= calendarEnd) {
    currentWeek.push({
      date: currentDate,
      isCurrentMonth: currentDate >= monthStart && currentDate <= monthEnd,
      isToday: isToday(currentDate),
      isPast: isPast(currentDate) && !isToday(currentDate),
    });
    
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    
    currentDate = addDays(currentDate, 1);
  }
  
  return weeks;
};

/**
 * Calculate duration between two dates
 */
export const calculateDuration = (
  startDate: Date | string,
  endDate: Date | string
): {
  minutes: number;
  hours: number;
  days: number;
  formatted: string;
} => {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  
  const minutes = differenceInMinutes(end, start);
  const hours = differenceInHours(end, start);
  const days = differenceInDays(end, start);
  
  let formatted = '';
  if (days > 0) {
    formatted = `${days} day${days > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    formatted = `${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    formatted = `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
  
  return { minutes, hours, days, formatted };
};

/**
 * Parse time string to Date object
 */
export const parseTimeString = (timeStr: string, baseDate: Date = new Date()): Date | null => {
  const timeRegex = /^(\d{1,2}):(\d{2})\s*(am|pm)?$/i;
  const match = timeStr.trim().match(timeRegex);
  
  if (!match) return null;
  
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3]?.toLowerCase();
  
  if (meridiem === 'pm' && hours < 12) hours += 12;
  if (meridiem === 'am' && hours === 12) hours = 0;
  
  const date = startOfDay(baseDate);
  return addMinutes(addHours(date, hours), minutes);
};

/**
 * Check if time slot is available
 */
export const isTimeSlotAvailable = (
  slotTime: Date | string,
  bookedSlots: (Date | string)[]
): boolean => {
  const slotDate = typeof slotTime === 'string' ? parseISO(slotTime) : slotTime;
  
  return !bookedSlots.some((bookedSlot) => {
    const bookedDate = typeof bookedSlot === 'string' ? parseISO(bookedSlot) : bookedSlot;
    return format(slotDate, 'yyyy-MM-dd HH:mm') === format(bookedDate, 'yyyy-MM-dd HH:mm');
  });
};

/**
 * Format appointment time range
 */
export const formatAppointmentTime = (
  startTime: Date | string,
  durationMinutes: number = 30
): string => {
  const start = typeof startTime === 'string' ? parseISO(startTime) : startTime;
  const end = addMinutes(start, durationMinutes);
  
  return `${format(start, 'hh:mm a')} - ${format(end, 'hh:mm a')}`;
};

/**
 * Get time until appointment
 */
export const getTimeUntilAppointment = (appointmentTime: Date | string): string => {
  const appointment = typeof appointmentTime === 'string' ? parseISO(appointmentTime) : appointmentTime;
  const now = new Date();
  
  if (isPast(appointment)) {
    return 'Past';
  }
  
  const minutes = differenceInMinutes(appointment, now);
  const hours = differenceInHours(appointment, now);
  const days = differenceInDays(appointment, now);
  
  if (minutes < 60) {
    return `in ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else if (hours < 24) {
    return `in ${hours} hour${hours !== 1 ? 's' : ''}`;
  } else {
    return `in ${days} day${days !== 1 ? 's' : ''}`;
  }
};

/**
 * Validate date is within allowed range
 */
export const isDateInRange = (
  date: Date | string,
  minDate?: Date | string,
  maxDate?: Date | string
): boolean => {
  const checkDate = typeof date === 'string' ? parseISO(date) : date;
  
  if (minDate) {
    const min = typeof minDate === 'string' ? parseISO(minDate) : minDate;
    if (checkDate < min) return false;
  }
  
  if (maxDate) {
    const max = typeof maxDate === 'string' ? parseISO(maxDate) : maxDate;
    if (checkDate > max) return false;
  }
  
  return true;
};
