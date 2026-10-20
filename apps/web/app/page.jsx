/**
 * apps/web/app/page.jsx
 *
 * Home page — Server Component.
 *
 * This is a minimal starter page.  It will be replaced with the full
 * design in Phase 4 (Frontend Implementation) once the Google Stitch
 * design is ready.
 *
 * What it shows:
 *   - Project identity badge (portfolio demo notice).
 *   - Brief description of the target area.
 *   - Navigation links to future sections.
 *   - A small interactive cart-count demo that reads from Redux
 *     (rendered in a separate Client Component below).
 */

import Link from 'next/link';
import CartBadgeDemo from '../components/CartBadgeDemo';

export const metadata = {
  title: 'Home | QuickBasket',
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-50 to-white">
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Placeholder logo — will be replaced in Phase 4 */}
            <span className="text-2xl">🛒</span>
            <span className="text-xl font-bold text-brand-700 tracking-tight">QuickBasket</span>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link href="/products" className="hover:text-brand-600 transition-colors">Products</Link>
            <Link href="/categories" className="hover:text-brand-600 transition-colors">Categories</Link>
            <Link href="/service-area" className="hover:text-brand-600 transition-colors">Service Area</Link>
            <Link href="/login" className="hover:text-brand-600 transition-colors">Login</Link>
            <Link
              href="/cart"
              className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5"
            >
              🛒 Cart
              {/* CartBadgeDemo is a client component — reads Redux state */}
              <CartBadgeDemo />
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero section ─────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        {/* Portfolio demo badge */}
        <div className="inline-flex items-center gap-2 bg-accent-100 text-accent-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <span>⚠️</span>
          <span>Portfolio Demo — No real orders, payments, or deliveries</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4">
          Fresh Groceries,{' '}
          <span className="text-brand-600">Delivered Fast</span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          QuickBasket serves{' '}
          <strong className="text-gray-800">Edappal</strong> and{' '}
          <strong className="text-gray-800">Vattamkulam</strong>, Kerala —
          browse fresh vegetables, grains, dairy, and more.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/products" className="btn-primary text-base px-8 py-3">
            Browse Products
          </Link>
          <Link href="/service-area" className="btn-secondary text-base px-8 py-3">
            Check My Area
          </Link>
        </div>
      </section>

      {/* ── Category grid placeholder ─────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { emoji: '🥬', name: 'Vegetables' },
            { emoji: '🍎', name: 'Fruits' },
            { emoji: '🌾', name: 'Grains & Pulses' },
            { emoji: '🥛', name: 'Dairy' },
            { emoji: '🫙', name: 'Oils & Ghee' },
            { emoji: '🍪', name: 'Snacks' },
            { emoji: '☕', name: 'Beverages' },
            { emoji: '🧴', name: 'Cleaning' },
          ].map((cat) => (
            <Link
              key={cat.name}
              href={`/categories/${cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
              className="card p-6 flex flex-col items-center gap-2 hover:shadow-md hover:border-brand-200 transition-all duration-150 cursor-pointer"
            >
              <span className="text-4xl">{cat.emoji}</span>
              <span className="text-sm font-semibold text-gray-700 text-center">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Status banner ─────────────────────────────────────────────────── */}
      <section className="bg-gray-800 text-white py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-bold mb-2">🚧 Under Construction</h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            QuickBasket 2026 is a full-stack portfolio project being built incrementally.
            Phase 2 (scaffold) is complete. The full product browsing, cart, and checkout
            experience will be added in upcoming phases.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
            {[
              { label: '✅ Phase 1 — Documentation', done: true },
              { label: '✅ Phase 2 — Scaffold', done: true },
              { label: '⬜ Phase 3 — Design', done: false },
              { label: '⬜ Phase 4 — Frontend', done: false },
              { label: '⬜ Phase 5 — Redux & Cart', done: false },
              { label: '⬜ Phase 6 — API & DB', done: false },
            ].map((phase) => (
              <span
                key={phase.label}
                className={`px-2 py-1 rounded ${
                  phase.done ? 'bg-brand-700 text-brand-100' : 'bg-gray-700 text-gray-400'
                }`}
              >
                {phase.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-white border-t border-gray-100 py-6 text-center text-sm text-gray-500">
        <p>
          QuickBasket 2026 — Full-stack portfolio demo.{' '}
          <strong>Not a real grocery service.</strong>
        </p>
      </footer>
    </main>
  );
}
