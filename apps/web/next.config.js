/** @type {import('next').NextConfig} */
const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://quickbasket-24lw.onrender.com'
    : 'http://localhost:5000');

const nextConfig = {
  // Proxy /api/* through Next.js so browser requests stay same-origin.
  // This also allows the API's HttpOnly session cookie to work on Vercel.
  // Set NEXT_PUBLIC_API_URL in the deployment environment to override this.
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
