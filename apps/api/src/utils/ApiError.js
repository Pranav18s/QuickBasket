/**
 * apps/api/src/utils/ApiError.js
 *
 * Custom error class that carries an HTTP status code alongside the message.
 * Controllers throw ApiError instances; the global error handler catches them
 * and sends the correct HTTP response.
 *
 * Usage:
 *   throw new ApiError(404, 'Product not found');
 *   throw new ApiError(400, 'Validation failed', [{ field: 'email', msg: '...' }]);
 */

class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code (e.g. 404, 400, 403).
   * @param {string} message - Human-readable error message.
   * @param {Array}  [errors=[]] - Optional array of field-level validation errors.
   */
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true; // distinguishes from unexpected programming errors
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
