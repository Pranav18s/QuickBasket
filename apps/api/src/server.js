/**
 * API entry point. Connect to MongoDB before accepting traffic so that
 * database-backed endpoints do not silently run in a degraded state.
 */
require('./config/env');

const { createApp } = require('./app');
const env = require('./config/env');
const { connectDB } = require('./config/db');

async function startServer() {
  await connectDB();
  const app = createApp();
  const server = app.listen(env.PORT, () => {
    console.log(`[API] QuickBasket API listening on port ${env.PORT}`);
    console.log(`[API] Health: http://localhost:${env.PORT}/api/v1/health`);
  });

  const shutdown = (signal) => {
    console.log(`[API] ${signal} received; shutting down.`);
    server.close(async () => {
      const mongoose = require('mongoose');
      await mongoose.disconnect();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

startServer().catch((error) => {
  console.error('[API] Startup failed:', error.message);
  process.exit(1);
});
