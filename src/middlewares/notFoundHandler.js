'use strict';

/**
 * Catches requests to undefined routes and returns a structured 404 response.
 */
function notFoundHandler(req, res) {
  return res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
    data: null,
  });
}

module.exports = notFoundHandler;
