'use strict';

const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

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
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      data: null,
      ...(err.errors && { errors: err.errors }),
    });
  }

  // ── Sequelize validation errors ───────────────────────
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const errors = err.errors.map((e) => e.message);
    return res.status(422).json({
      success: false,
      message: 'Database validation error.',
      data: null,
      errors,
    });
  }

  // ── Sequelize connection errors ───────────────────────
  if (err.name === 'SequelizeConnectionError' || err.name === 'SequelizeConnectionRefusedError') {
    return res.status(503).json({
      success: false,
      message: 'Database connection unavailable. Please try again later.',
      data: null,
    });
  }

  // ── JSON parsing errors (malformed body) ──────────────
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body.',
      data: null,
    });
  }

  // ── CORS errors ───────────────────────────────────────
  if (err.message && err.message.startsWith('CORS policy')) {
    return res.status(403).json({
      success: false,
      message: err.message,
      data: null,
    });
  }

  // ── Fallback: unexpected / programming errors ─────────
  return res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred. Please try again later.'
        : err.message,
    data: null,
  });
}

module.exports = errorHandler;
