/**
 * @quickbasket/shared — paise.js
 *
 * Monetary helpers for QuickBasket 2026.
 *
 * IMPORTANT: All monetary values in the database and API are stored as
 * integer paise (1 Indian Rupee = 100 paise).  Display conversion to
 * rupees happens ONLY in the frontend (or via these helpers).
 *
 * Examples:
 *   toPaise(85)        → 8500
 *   toRupees(8500)     → 85
 *   formatINR(8500)    → "₹85.00"
 *   formatINR(8550)    → "₹85.50"
 */

/**
 * Convert a rupee amount (number) to integer paise.
 * @param {number} rupees - Amount in rupees (may have decimals).
 * @returns {number} Integer paise.
 */
function toPaise(rupees) {
  return Math.round(rupees * 100);
}

/**
 * Convert integer paise to rupees.
 * @param {number} paise - Integer paise.
 * @returns {number} Rupees (floating point).
 */
function toRupees(paise) {
  return paise / 100;
}

/**
 * Format integer paise as a localised INR string (e.g. "₹85.00").
 * Uses Intl.NumberFormat when available, falls back to a simple template.
 * @param {number} paise - Integer paise.
 * @returns {string} Formatted price string.
 */
function formatINR(paise) {
  const rupees = toRupees(paise);
  if (typeof Intl !== 'undefined' && Intl.NumberFormat) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(rupees);
  }
  // Fallback for environments without Intl
  return `\u20B9${rupees.toFixed(2)}`;
}

module.exports = { toPaise, toRupees, formatINR };
