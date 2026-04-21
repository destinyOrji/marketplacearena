// Distance calculation utilities

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
export const calculateDistance = (
  coord1: [number, number],
  coord2: [number, number]
): number => {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;

  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Calculate estimated time of arrival based on distance and average speed
 * Returns ETA in minutes
 */
export const calculateETA = (distanceInMeters: number, averageSpeedKmh: number = 60): number => {
  const distanceInKm = distanceInMeters / 1000;
  const timeInHours = distanceInKm / averageSpeedKmh;
  return Math.ceil(timeInHours * 60);
};

/**
 * Get navigation URL for different map services
 */
export const getNavigationUrl = (
  destination: [number, number],
  service: 'google' | 'waze' | 'apple' = 'google'
): string => {
  const [lat, lng] = destination;

  switch (service) {
    case 'google':
      return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    case 'waze':
      return `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
    case 'apple':
      return `http://maps.apple.com/?daddr=${lat},${lng}`;
    default:
      return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }
};
