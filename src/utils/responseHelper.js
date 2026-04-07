'use strict';

/**
 * Standardised API response helpers.
 *
 * All responses follow the same envelope:
 * {
 *   "success": boolean,
 *   "message": string,
 *   "data":    object | array | null,
 *   "errors":  string[]          // only present on failures
 * }
 */

/**
 * Sends a successful JSON response.
 *
 * @param {import('express').Response} res
 * @param {number} statusCode - HTTP 2xx code
 * @param {string} message    - Human-readable success message
 * @param {*}      data       - Payload (object, array, or null)
 */
function sendSuccess(res, statusCode, message, data = null) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/**
 * Sends a failure JSON response.
 *
 * @param {import('express').Response} res
 * @param {number}   statusCode - HTTP 4xx / 5xx code
 * @param {string}   message    - Human-readable error message
 * @param {string[]} [errors]   - Optional field-level validation errors
 */
function sendError(res, statusCode, message, errors = []) {
  const body = {
    success: false,
    message,
    data: null,
  };

  if (errors.length > 0) {
    body.errors = errors;
  }

  return res.status(statusCode).json(body);
}

module.exports = { sendSuccess, sendError };
