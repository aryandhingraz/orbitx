/**
 * Angle Math Utilities for Orbit Ring Marker Positioning (§2.5, §5)
 */

/**
 * Converts Longitude (-180° to +180°) into a 360° ring angle
 */
export function longitudeToAngle(longitude) {
  if (longitude == null || isNaN(longitude)) return 0;
  // Map -180..180 to 0..360
  return ((longitude + 180) % 360 + 360) % 360;
}

/**
 * Converts Latitude (-90° to +90°) into a 360° ring angle
 */
export function latitudeToAngle(latitude) {
  if (latitude == null || isNaN(latitude)) return 0;
  return ((latitude + 90) / 180) * 360;
}

/**
 * Converts local solar time fraction into 360° rotation
 */
export function timeToAngle(date = new Date()) {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  return (totalSeconds / 86400) * 360;
}

/**
 * Normalizes any value 0..1 into 0..360 angle
 */
export function fractionToAngle(fraction) {
  if (fraction == null || isNaN(fraction)) return 0;
  return (Math.max(0, Math.min(1, fraction))) * 360;
}
