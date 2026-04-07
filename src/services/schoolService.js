'use strict';

const School = require('../models/School');
const { calculateDistance } = require('../utils/haversine');
const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

/**
 * SchoolService — all business logic for school operations.
 * Controllers are kept thin; all heavy lifting lives here.
 */

/**
 * Creates a new school record in the database.
 *
 * @param {Object} data - { name, address, latitude, longitude }
 * @returns {Promise<School>} newly created school instance
 */
async function createSchool(data) {
  const { name, address, latitude, longitude } = data;

  // Check for duplicate school at same coordinates (business rule)
  const existing = await School.findOne({
    where: { latitude, longitude },
  });

  if (existing) {
    throw new ApiError(
      409,
      `A school already exists at coordinates (${latitude}, ${longitude}): "${existing.name}".`
    );
  }

  logger.info(`Creating school: "${name}" at (${latitude}, ${longitude})`);

  const school = await School.create({ name, address, latitude, longitude });

  logger.info(`School created with id=${school.id}`);
  return school;
}

/**
 * Retrieves all schools, sorted by distance from a given coordinate.
 *
 * @param {number} userLat  - User's latitude
 * @param {number} userLon  - User's longitude
 * @returns {Promise<Array>} Array of school objects with `distance` appended (km)
 */
async function getSchoolsSortedByDistance(userLat, userLon) {
  const schools = await School.findAll({ raw: true });

  if (schools.length === 0) {
    return [];
  }

  // Attach distance (km) to each school object, then sort ascending
  const schoolsWithDistance = schools.map((school) => ({
    ...school,
    distance: parseFloat(
      calculateDistance(userLat, userLon, school.latitude, school.longitude).toFixed(2)
    ),
  }));

  schoolsWithDistance.sort((a, b) => a.distance - b.distance);

  logger.info(
    `Returning ${schoolsWithDistance.length} schools sorted by distance from (${userLat}, ${userLon})`
  );

  return schoolsWithDistance;
}

/**
 * Finds a single school by its primary key.
 *
 * @param {number} id
 * @returns {Promise<School>}
 */
async function getSchoolById(id) {
  const school = await School.findByPk(id);
  if (!school) {
    throw new ApiError(404, `School with id=${id} not found.`);
  }
  return school;
}

module.exports = {
  createSchool,
  getSchoolsSortedByDistance,
  getSchoolById,
};
