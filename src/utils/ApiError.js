'use strict';

/**
 * Custom operational error class.
 *
 * Distinguishes expected API errors (4xx) from programming bugs (5xx).
 * The global error handler checks `instanceof ApiError` to decide
 * whether to expose the message to the client.
 *
 * @example
 * throw new ApiError(404, 'School not found.');
 * throw new ApiError(409, 'Duplicate school.', ['coordinates already registered']);
 */
class ApiError extends Error {
  /**
   * @param {number}   statusCode - HTTP status code
   * @param {string}   message    - Human-readable error description
   * @param {string[]} [errors]   - Optional array of field-level messages
   */
  constructor(statusCode, message, errors = []) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true; // flag used by errorHandler

    // Capture clean stack trace (V8 specific)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ApiError;
