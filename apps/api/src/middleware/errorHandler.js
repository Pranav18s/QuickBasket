/**
 * apps/api/src/middleware/errorHandler.js
 *
 * Global Express error-handling middleware.
 * Must be mounted LAST in app.js (after all routes).
 *
 * Converts any error to a consistent JSON response:
 * {
 *   "success": false,
 *   "message": "Human-readable message",
 *   "errors": []          // optional field-level details
 * }
 *
 * In development, the stack trace is included in the response to help debugging.
 * In production, the stack trace is omitted.
 */

const env = require('../config/env');

function errorHandler(err, req, res, _next) {
  // Default to 500 Internal Server Error
  const statusCode = err.statusCode || 500;

  // For unexpected (non-operational) errors, use a generic message in production
  const message =
    err.isOperational || env.NODE_ENV === 'development'
      ? err.message
      : 'Something went wrong. Please try again later.';

  const response = {
    success: false,
    message,
    errors: err.errors || [],
  };

  // Include stack trace only in development
  if (env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  console.error(`[Error] ${statusCode} — ${err.message}`, env.NODE_ENV === 'development' ? err.stack : '');

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
