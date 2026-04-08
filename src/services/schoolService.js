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
 * @returns {Promise<Object>} Sorted schools with pagination metadata
 */
async function getSchoolsSortedByDistance(userLat, userLon, page, limit) {
  const schools = await School.findAll({ raw: true });

  if (schools.length === 0) {
    return {
      totalCount: 0,
      page: 1,
      limit: 0,
      totalPages: 0,
      schools: [],
    };
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

  const hasPagination = Number.isInteger(page) && Number.isInteger(limit);
  if (!hasPagination) {
    return {
      totalCount: schoolsWithDistance.length,
      page: 1,
      limit: schoolsWithDistance.length,
      totalPages: 1,
      schools: schoolsWithDistance,
    };
  }

  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedSchools = schoolsWithDistance.slice(start, end);
  const totalPages = Math.ceil(schoolsWithDistance.length / limit);

  return {
    totalCount: schoolsWithDistance.length,
    page,
    limit,
    totalPages,
    schools: paginatedSchools,
  };
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
