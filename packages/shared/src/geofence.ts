import { GEOFENCE_CONFIG } from './constants';

export function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const EARTH_RADIUS_METERS = 6371000;
  const toRadians = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_METERS * c * 10) / 10;
}

export interface GeofenceValidationResult {
  isWithin: boolean;
  distanceMeters: number;
  allowedRadiusMeters: number;
  message: string;
}

export function validateStoreGeofence(
  agentLat: number,
  agentLng: number,
  storeLat: number,
  storeLng: number,
  customRadiusMeters: number = GEOFENCE_CONFIG.DEFAULT_CHECKIN_RADIUS_METERS
): GeofenceValidationResult {
  const distance = calculateHaversineDistanceMeters(agentLat, agentLng, storeLat, storeLng);
  const isWithin = distance <= customRadiusMeters;

  return {
    isWithin,
    distanceMeters: distance,
    allowedRadiusMeters: customRadiusMeters,
    message: isWithin
      ? `Check-in verified. You are ${distance}m from the store (within allowed ${customRadiusMeters}m radius).`
      : `Check-in rejected. You are ${distance}m away from the store. You must be within ${customRadiusMeters}m to check in.`
  };
}
