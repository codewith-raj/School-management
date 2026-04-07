'use strict';

/**
 * Haversine Distance Calculator
 *
 * Computes the great-circle distance between two points on the Earth's
 * surface given their WGS-84 latitude/longitude coordinates.
 *
 * Formula:
 *   a = sin²(Δlat/2) + cos(lat1) · cos(lat2) · sin²(Δlon/2)
 *   c = 2 · atan2(√a, √(1−a))
 *   d = R · c
 *
 * @see https://en.wikipedia.org/wiki/Haversine_formula
 */

/** Earth's mean radius in kilometres (WGS-84 standard) */
const EARTH_RADIUS_KM = 6371;

/**
 * Converts degrees to radians.
 *
 * @param {number} degrees
 * @returns {number} radians
 */
function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculates the distance between two geographic coordinates using the
 * Haversine formula. No external API required.
 *
 * @param {number} lat1 - Latitude of point 1 (degrees)
 * @param {number} lon1 - Longitude of point 1 (degrees)
 * @param {number} lat2 - Latitude of point 2 (degrees)
 * @param {number} lon2 - Longitude of point 2 (degrees)
 * @returns {number} Distance in kilometres (floating-point)
 *
 * @example
 * const km = calculateDistance(28.6139, 77.2090, 19.0760, 72.8777);
 * // ≈ 1153.9 km (New Delhi → Mumbai)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

module.exports = { calculateDistance, toRadians, EARTH_RADIUS_KM };
