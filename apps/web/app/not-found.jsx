/**
 * apps/web/app/not-found.jsx
 *
 * Custom 404 page — shown for any unmatched route.
 * Kept minimal for Phase 2; will be styled in Phase 4.
 */

import Link from 'next/link';

export const metadata = {
  title: '404 — Page Not Found | QuickBasket',
};

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-gray-50">
      <span className="text-6xl mb-4">🛒</span>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Page not found</h1>
      <p className="text-gray-600 mb-6 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/" className="btn-primary">
        Back to Home
      </Link>
    </main>
  );
}
