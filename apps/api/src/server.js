/**
 * apps/api/src/server.js
 *
 * Entry point — creates the Express app and starts listening.
 *
 * Note on MongoDB:
 *   connectDB() is imported but NOT called in this starter scaffold.
 *   The database connection will be enabled in Phase 6 when Mongoose models
 *   and the seed script are in place.  The health endpoint works without a DB.
 */

// Load environment variables FIRST, before any other imports that use them.
require('./config/env');

const { createApp } = require('./app');
const env = require('./config/env');
// const { connectDB } = require('./config/db'); // Uncomment in Phase 6

const app = createApp();
const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`[API] QuickBasket API is running at http://localhost:${PORT}`);
  console.log(`[API] Environment: ${env.NODE_ENV}`);
  console.log(`[API] Health check: http://localhost:${PORT}/api/v1/health`);
  // console.log('[DB] MongoDB connection will be enabled in Phase 6.');
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
process.on('unhandledRejection', (reason) => {
  console.error('[Server] Unhandled promise rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('[Server] Uncaught exception:', error);
  process.exit(1);
});
