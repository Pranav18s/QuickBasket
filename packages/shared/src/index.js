/**
 * @quickbasket/shared — index.js
 *
 * Barrel file for @quickbasket/shared.
 * Import specific sub-paths (e.g. @quickbasket/shared/utils/paise) or
 * use this barrel for convenience.
 */

const { toPaise, toRupees, formatINR } = require('./utils/paise');
const { toSlug } = require('./utils/slug');
const { schemas } = require('./validation/schemas');

module.exports = {
  // Monetary helpers
  toPaise,
  toRupees,
  formatINR,

  // Slug helpers
  toSlug,

  // Validation schemas
  schemas,
};
