'use strict';

const schoolService = require('../services/schoolService');
const { sendSuccess } = require('../utils/responseHelper');
const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

/**
 * @swagger
 * /api/schools:
 *   post:
 *     summary: Add a new school
 *     tags: [Schools]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSchoolBody'
 *           examples:
 *             example1:
 *               summary: Delhi Public School
 *               value:
 *                 name: "Delhi Public School"
 *                 address: "15 Ring Road, New Delhi 110001"
 *                 latitude: 28.6139
 *                 longitude: 77.2090
 *     responses:
 *       201:
 *         description: School created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/School'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Duplicate school at same coordinates
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *
 * /addSchool:
 *   post:
 *     summary: Add a new school (assignment alias)
 *     tags: [Schools]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSchoolBody'
 *     responses:
 *       201:
 *         description: School created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
async function addSchool(req, res, next) {
  try {
    const { name, address, latitude, longitude } = req.body;

    const school = await schoolService.createSchool({
      name: name.trim(),
      address: address.trim(),
      latitude,
      longitude,
    });

    return sendSuccess(res, 201, 'School added successfully.', school);
  } catch (err) {
    logger.error('addSchool error:', err.message);
    next(err);
  }
}

/**
 * @swagger
 * /api/schools:
 *   get:
 *     summary: List all schools sorted by proximity
 *     tags: [Schools]
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *           minimum: -90
 *           maximum: 90
 *         description: Your current latitude
 *         example: 28.6139
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *           minimum: -180
 *           maximum: 180
 *         description: Your current longitude
 *         example: 77.2090
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Optional page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Optional page size for pagination
 *         example: 10
 *     responses:
 *       200:
 *         description: Schools sorted by distance from the given coordinates
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         totalCount:
 *                           type: integer
 *                           example: 5
 *                         userLocation:
 *                           type: object
 *                           properties:
 *                             latitude:
 *                               type: number
 *                               example: 28.6139
 *                             longitude:
 *                               type: number
 *                               example: 77.2090
 *                         schools:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/SchoolWithDistance'
 *       400:
 *         description: Invalid or missing latitude/longitude
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *
 * /listSchools:
 *   get:
 *     summary: List schools sorted by distance (assignment alias)
 *     tags: [Schools]
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Schools sorted by distance
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error
 */
async function listSchools(req, res, next) {
  try {
    const { latitude, longitude, page, limit } = req.query;
    const userLat = Number(latitude);
    const userLon = Number(longitude);
    const parsedPage = page !== undefined ? Number(page) : undefined;
    const parsedLimit = limit !== undefined ? Number(limit) : undefined;

    if (!Number.isFinite(userLat) || !Number.isFinite(userLon)) {
      throw new ApiError(400, 'latitude and longitude must be valid numbers.', [
        'latitude/longitude conversion failed.',
      ]);
    }

    const result = await schoolService.getSchoolsSortedByDistance(
      userLat,
      userLon,
      Number.isInteger(parsedPage) ? parsedPage : undefined,
      Number.isInteger(parsedLimit) ? parsedLimit : undefined
    );

    return sendSuccess(res, 200, 'Schools retrieved and sorted by distance.', {
      totalCount: result.totalCount,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      userLocation: { latitude: userLat, longitude: userLon },
      schools: result.schools,
    });
  } catch (err) {
    logger.error('listSchools error:', err.message);
    next(err);
  }
}

/**
 * @swagger
 * /api/schools/{id}:
 *   get:
 *     summary: Get a school by ID
 *     tags: [Schools]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: School ID
 *         example: 1
 *     responses:
 *       200:
 *         description: School found
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/School'
 *       404:
 *         description: School not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
async function getSchoolById(req, res, next) {
  try {
    const { id } = req.params;
    const school = await schoolService.getSchoolById(parseInt(id, 10));
    return sendSuccess(res, 200, 'School retrieved successfully.', school);
  } catch (err) {
    logger.error('getSchoolById error:', err.message);
    next(err);
  }
}

module.exports = { addSchool, listSchools, getSchoolById };
