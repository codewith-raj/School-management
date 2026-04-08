'use strict';

const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');
const { sendError } = require('../utils/responseHelper');

/**
 * Global error-handling middleware.
 *
 * Must have exactly 4 parameters for Express to treat it as an error handler.
 * Catches:
 *   - Custom ApiError instances (operational errors)
 *   - Sequelize validation / unique constraint errors
 *   - Generic unhandled errors
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Log every error server-side
  logger.error({
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // ── Operational / known errors ─────────────────────────
  if (err instanceof ApiError) {
    return sendError(res, err.statusCode, err.message, err.errors || []);
  }

  // ── Sequelize validation errors ───────────────────────
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const errors = err.errors.map((e) => e.message);
    return sendError(res, 422, 'Database validation error.', errors);
  }

  // ── Sequelize connection errors ───────────────────────
  if (err.name === 'SequelizeConnectionError' || err.name === 'SequelizeConnectionRefusedError') {
    return sendError(res, 503, 'Database connection unavailable. Please try again later.', []);
  }

  // ── JSON parsing errors (malformed body) ──────────────
  if (err.type === 'entity.parse.failed') {
    return sendError(res, 400, 'Invalid JSON in request body.', []);
  }

  // ── CORS errors ───────────────────────────────────────
  if (err.message && err.message.startsWith('CORS policy')) {
    return sendError(res, 403, err.message, []);
  }

  // ── Fallback: unexpected / programming errors ─────────
  return sendError(
    res,
    500,
    process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred. Please try again later.'
      : err.message,
    []
  );
}

module.exports = errorHandler;
