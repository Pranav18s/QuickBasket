/**
 * Loads and validates environment variables from the repository root.
 */
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || process.env.API_PORT || '5000', 10),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/quickbasket',
  JWT_SECRET: process.env.JWT_SECRET || 'INSECURE_FALLBACK_CHANGE_IN_PRODUCTION',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  COOKIE_SECURE: process.env.COOKIE_SECURE === undefined
    ? process.env.NODE_ENV === 'production'
    : process.env.COOKIE_SECURE === 'true',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  AI_PROVIDER_API_KEY: process.env.AI_PROVIDER_API_KEY || '',
  AI_PROVIDER_BASE_URL: process.env.AI_PROVIDER_BASE_URL || 'https://api.openai.com/v1',
  AI_MODEL: process.env.AI_MODEL || 'gpt-4o-mini',
};

if (env.NODE_ENV === 'production' && env.JWT_SECRET === 'INSECURE_FALLBACK_CHANGE_IN_PRODUCTION') {
  throw new Error('JWT_SECRET must be set in production. Check your environment variables.');
}

module.exports = env;
