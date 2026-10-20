/**
 * @quickbasket/shared — slug.js
 *
 * URL slug helpers for QuickBasket 2026.
 * Used to generate consistent slugs for products and categories.
 *
 * Example:
 *   toSlug("Ponni Rice 5 kg")  → "ponni-rice-5-kg"
 *   toSlug("Coconut Oil (1 L)") → "coconut-oil-1-l"
 */

const slugify = require('slugify');

/**
 * Convert a plain string to a URL-safe slug.
 * - Converts to lowercase.
 * - Replaces spaces and non-alphanumeric characters with hyphens.
 * - Strips leading/trailing hyphens.
 *
 * @param {string} str - Input string (e.g. a product name).
 * @returns {string} URL-safe slug.
 */
function toSlug(str) {
  return slugify(str, {
    lower: true,
    strict: true,   // removes characters that are not alphanumeric or hyphens
    trim: true,
  });
}

module.exports = { toSlug };
