/**
 * apps/api/src/routes/v1/index.js
 *
 * Mounts all v1 API routers under /api/v1.
 * New resource routers are added here as the API grows.
 */

const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();
const aiRouter = require('./ai');
const productsRouter = require('./products');

// ── Health ─────────────────────────────────────────────────────────────────────
/**
 * GET /api/v1/health
 *
 * Public endpoint.  Returns a JSON object confirming the API process is alive.
 * It confirms that the API process is responding. Database-backed routes also
 * require a reachable MongoDB connection.
 *
 * Response:
 *   200 { success: true, data: { status: "ok", timestamp: "<ISO string>" } }
 */
router.get(
  '/health',
  asyncHandler(async (_req, res) => {
    res.json({
      success: true,
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: 'v1',
        environment: process.env.NODE_ENV || 'development',
      },
    });
  })
);

router.use('/ai', aiRouter);
router.use('/products', productsRouter);

// ── Future routers ─────────────────────────────────────────────────────────────
// Phase 6: const productsRouter = require('./products');
//           router.use('/products', productsRouter);
// Phase 7: const authRouter = require('./auth');
//           router.use('/auth', authRouter);

module.exports = router;
