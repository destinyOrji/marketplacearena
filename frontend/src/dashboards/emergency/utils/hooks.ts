// Custom React hooks

import { useState, useEffect } from 'react';

/**
 * Debounce hook for delaying value updates
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Throttle hook for limiting function calls
 */
export function useThrottle<T>(value: T, interval: number = 1000): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdated;

    if (timeSinceLastUpdate >= interval) {
      setThrottledValue(value);
      setLastUpdated(now);
    } else {
      const timeout = setTimeout(() => {
        setThrottledValue(value);
        setLastUpdated(Date.now());
      }, interval - timeSinceLastUpdate);

      return () => clearTimeout(timeout);
    }
  }, [value, interval, lastUpdated]);

  return throttledValue;
}
