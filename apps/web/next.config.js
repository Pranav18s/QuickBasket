/** @type {import('next').NextConfig} */
// Production traffic must go to the deployed Render API. Keep localhost for
// local development only; a stale Vercel environment variable must not send
// production API requests to localhost.
const apiBaseUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://quickbasket-24lw.onrender.com'
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const nextConfig = {
  // Proxy /api/* through Next.js so browser requests remain same-origin.
  // This lets the browser use the API's HttpOnly session cookie on Vercel.
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
