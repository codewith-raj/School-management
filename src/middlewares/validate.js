'use strict';

const Joi = require('joi');
const { sendError } = require('../utils/responseHelper');

// ─────────────────────────────────────────────────────────
// Joi schemas
// ─────────────────────────────────────────────────────────

/**
 * Schema for POST /api/schools body.
 */
const addSchoolSchema = Joi.object({
  name: Joi.string().min(2).max(255).required().messages({
    'string.base': 'name must be a string.',
    'string.empty': 'name is required and cannot be empty.',
    'string.min': 'name must be at least 2 characters.',
    'string.max': 'name must not exceed 255 characters.',
    'any.required': 'name is required.',
  }),

  address: Joi.string().min(5).max(500).required().messages({
    'string.base': 'address must be a string.',
    'string.empty': 'address is required and cannot be empty.',
    'string.min': 'address must be at least 5 characters.',
    'string.max': 'address must not exceed 500 characters.',
    'any.required': 'address is required.',
  }),

  latitude: Joi.number().min(-90).max(90).required().messages({
    'number.base': 'latitude must be a numeric value.',
    'number.min': 'latitude must be >= -90.',
    'number.max': 'latitude must be <= 90.',
    'any.required': 'latitude is required.',
  }),

  longitude: Joi.number().min(-180).max(180).required().messages({
    'number.base': 'longitude must be a numeric value.',
    'number.min': 'longitude must be >= -180.',
    'number.max': 'longitude must be <= 180.',
    'any.required': 'longitude is required.',
  }),
});

/**
 * Schema for GET /api/schools query params.
 */
const listSchoolsSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required().messages({
    'number.base': 'latitude query param must be a number.',
    'number.min': 'latitude must be >= -90.',
    'number.max': 'latitude must be <= 90.',
    'any.required': 'latitude query param is required.',
  }),

  longitude: Joi.number().min(-180).max(180).required().messages({
    'number.base': 'longitude query param must be a number.',
    'number.min': 'longitude must be >= -180.',
    'number.max': 'longitude must be <= 180.',
    'any.required': 'longitude query param is required.',
  }),
  page: Joi.number().integer().min(1).optional().messages({
    'number.base': 'page must be a number.',
    'number.integer': 'page must be an integer.',
    'number.min': 'page must be >= 1.',
  }),
  limit: Joi.number().integer().min(1).max(100).optional().messages({
    'number.base': 'limit must be a number.',
    'number.integer': 'limit must be an integer.',
    'number.min': 'limit must be >= 1.',
    'number.max': 'limit must be <= 100.',
  }),
});

/**
 * Sanitizes list-schools query params before Joi validation.
 * Trims spaces and safely converts with Number() so invalid NaN is caught.
 */
function sanitizeListSchoolsQuery(req, res, next) {
  const trimString = (value) => (typeof value === 'string' ? value.trim() : value);

  req.query.latitude = trimString(req.query.latitude);
  req.query.longitude = trimString(req.query.longitude);
  req.query.page = trimString(req.query.page);
  req.query.limit = trimString(req.query.limit);

  if (typeof req.query.latitude === 'string' && req.query.latitude !== '') {
    req.query.latitude = Number(req.query.latitude);
  }
  if (typeof req.query.longitude === 'string' && req.query.longitude !== '') {
    req.query.longitude = Number(req.query.longitude);
  }
  if (typeof req.query.page === 'string' && req.query.page !== '') {
    req.query.page = Number(req.query.page);
  }
  if (typeof req.query.limit === 'string' && req.query.limit !== '') {
    req.query.limit = Number(req.query.limit);
  }

  return next();
}

// ─────────────────────────────────────────────────────────
// Middleware factory
// ─────────────────────────────────────────────────────────

/**
 * Creates an Express middleware that validates a data source
 * against a Joi schema. Sends a 400 on validation failure.
 *
 * @param {Joi.ObjectSchema} schema
 * @param {'body'|'query'|'params'} source
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,   // collect all errors, not just the first
      stripUnknown: true,  // remove extra fields silently
      convert: true,       // coerce types (e.g. "28.6" → 28.6 for query strings)
    });

    if (error) {
      const errors = error.details.map((d) => d.message);
      return sendError(res, 400, 'Validation failed.', errors);
    }

    // Replace req[source] with the coerced & stripped value
    req[source] = value;
    return next();
  };
}

// ─────────────────────────────────────────────────────────
// Exported middleware instances
// ─────────────────────────────────────────────────────────
const validateAddSchool = validate(addSchoolSchema, 'body');
const validateListSchools = validate(listSchoolsSchema, 'query');

module.exports = {
  validateAddSchool,
  validateListSchools,
  sanitizeListSchoolsQuery,
};
