'use strict';

const schoolService = require('../services/schoolService');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const logger = require('../utils/logger');

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
 */
async function listSchools(req, res, next) {
  try {
    const { latitude, longitude } = req.query;

    // query params come in as strings → parse to float
    const userLat = parseFloat(latitude);
    const userLon = parseFloat(longitude);

    const schools = await schoolService.getSchoolsSortedByDistance(userLat, userLon);

    return sendSuccess(res, 200, 'Schools retrieved and sorted by distance.', {
      totalCount: schools.length,
      userLocation: { latitude: userLat, longitude: userLon },
      schools,
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
