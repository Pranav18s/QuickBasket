/**
 * apps/api/src/config/env.js
 *
 * Loads and validates environment variables from the root .env file.
 * Call this once at app startup before any other module that needs env vars.
 *
 * Why load dotenv here?
 *   We centralise environment loading so that every other module simply
 *   reads process.env.* without worrying about whether dotenv has run yet.
 */

const path = require('path');
const dotenv = require('dotenv');

// Load .env from the repo root (two levels up from apps/api/src/config/)
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || process.env.API_PORT || '5000', 10),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/quickbasket',
  JWT_SECRET: process.env.JWT_SECRET || 'INSECURE_FALLBACK_CHANGE_IN_PRODUCTION',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  // Override to false for local HTTP demos; defaults to secure cookies in production.
  COOKIE_SECURE: process.env.COOKIE_SECURE === undefined
    ? process.env.NODE_ENV === 'production'
    : process.env.COOKIE_SECURE === 'true',
  AI_PROVIDER_API_KEY: process.env.AI_PROVIDER_API_KEY || '',
  AI_PROVIDER_BASE_URL: process.env.AI_PROVIDER_BASE_URL || 'https://api.openai.com/v1',
  AI_MODEL: process.env.AI_MODEL || 'gpt-4o-mini',
};

if (env.NODE_ENV === 'production' && env.JWT_SECRET === 'INSECURE_FALLBACK_CHANGE_IN_PRODUCTION') {
  throw new Error('JWT_SECRET must be set in production. Check your environment variables.');
}

module.exports = env;
