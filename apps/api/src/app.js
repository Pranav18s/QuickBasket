/**
 * apps/api/src/app.js
 *
 * Express application factory.
 * Creates and configures the Express app without starting the server.
 * This separation makes the app testable: tests can import `createApp()`
 * without binding to a port.
 */

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const v1Router = require('./routes/v1/index');
const errorHandler = require('./middleware/errorHandler');
const ApiError = require('./utils/ApiError');

function createApp() {
  const app = express();

  // ── Security headers (helmet sets sensible defaults) ────────────────────────
  app.use(helmet());

  // ── CORS ────────────────────────────────────────────────────────────────────
  // Allow only the configured frontend origin.
  // credentials: true is required so that the browser sends cookies with
  // cross-origin requests (e.g. Next.js on :3000 → Express on :5000).
  const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());
  app.use(
    cors({
      origin: function (origin, callback) {
        // Allow requests with no Origin header (curl, Postman, same-origin SSR)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS: Origin ${origin} is not allowed`));
        }
      },
      credentials: true,
    })
  );

  // ── Request logging ──────────────────────────────────────────────────────────
  // 'dev' format prints: METHOD /path STATUS - responseTime ms
  if (env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // ── Body parsers ─────────────────────────────────────────────────────────────
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(cookieParser());

  // ── Global rate limiter (lenient — tight limits go on specific routes) ───────
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests, please try again later.',
    },
  });
  app.use(globalLimiter);

  // ── API v1 routes ─────────────────────────────────────────────────────────
  app.use('/api/v1', v1Router);

  // ── 404 handler (unknown routes) ─────────────────────────────────────────────
  app.use((_req, _res, next) => {
    next(new ApiError(404, 'Route not found'));
  });

  // ── Global error handler (must be last) ──────────────────────────────────────
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
