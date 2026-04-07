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

  latitude: Joi.number().float().min(-90).max(90).required().messages({
    'number.base': 'latitude must be a numeric value.',
    'number.min': 'latitude must be >= -90.',
    'number.max': 'latitude must be <= 90.',
    'any.required': 'latitude is required.',
  }),

  longitude: Joi.number().float().min(-180).max(180).required().messages({
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
  latitude: Joi.number().float().min(-90).max(90).required().messages({
    'number.base': 'latitude query param must be a number.',
    'number.min': 'latitude must be >= -90.',
    'number.max': 'latitude must be <= 90.',
    'any.required': 'latitude query param is required.',
  }),

  longitude: Joi.number().float().min(-180).max(180).required().messages({
    'number.base': 'longitude query param must be a number.',
    'number.min': 'longitude must be >= -180.',
    'number.max': 'longitude must be <= 180.',
    'any.required': 'longitude query param is required.',
  }),
});

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
};
