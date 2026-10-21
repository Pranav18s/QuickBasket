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

// ── Health ─────────────────────────────────────────────────────────────────────
/**
 * GET /api/v1/health
 *
 * Public endpoint.  Returns a JSON object confirming the API process is alive.
 * It does NOT confirm MongoDB is connected — use a dedicated DB health check
 * for that once the database is wired in Phase 6.
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

// ── Future routers ─────────────────────────────────────────────────────────────
// Phase 6: const productsRouter = require('./products');
//           router.use('/products', productsRouter);
// Phase 7: const authRouter = require('./auth');
//           router.use('/auth', authRouter);

module.exports = router;
