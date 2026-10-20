/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy /api/* to the Express backend during development.
  // In production, the reverse proxy (nginx / cloud platform) handles routing.
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
