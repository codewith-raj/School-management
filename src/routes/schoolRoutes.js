'use strict';

const express = require('express');
const router = express.Router();

const schoolController = require('../controllers/schoolController');
const { validateAddSchool, validateListSchools } = require('../middlewares/validate');

/**
 * @swagger
 * tags:
 *   name: Schools
 *   description: School management endpoints
 */

/**
 * POST /api/schools
 * Validate body → controller → service → DB
 */
router.post('/', validateAddSchool, schoolController.addSchool);

/**
 * GET /api/schools?latitude=X&longitude=Y
 * Validate query params → controller → service → sorted list
 */
router.get('/', validateListSchools, schoolController.listSchools);

/**
 * GET /api/schools/:id
 * Retrieve a single school by PK
 */
router.get('/:id', schoolController.getSchoolById);

module.exports = router;
