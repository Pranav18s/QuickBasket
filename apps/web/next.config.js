/** @type {import('next').NextConfig} */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Production traffic must go to the deployed Render API. Keep localhost for
// local development only; a stale Vercel environment variable must not send
// production API requests to localhost.
const apiBaseUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://quickbasket-24lw.onrender.com'
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const nextConfig = {
  // Expose only the public Google OAuth client ID to the browser bundle.
  env: {
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiBaseUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
