/**
 * apps/api/src/utils/asyncHandler.js
 *
 * Wraps an async Express route handler to automatically pass any rejected
 * promise to Express's next() error handler, so we don't need try/catch
 * blocks in every controller function.
 *
 * Usage:
 *   router.get('/products', asyncHandler(async (req, res) => {
 *     const products = await ProductService.findAll();
 *     res.json({ success: true, data: { products } });
 *   }));
 */

/**
 * @param {Function} fn - An async Express route handler.
 * @returns {Function} Express middleware that catches rejected promises.
 */
function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
