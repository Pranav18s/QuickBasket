'use client';

/**
 * apps/web/components/CartBadgeDemo.jsx
 *
 * Tiny Client Component used in the home-page header to show the current
 * cart item count from Redux.
 *
 * This is separated from the Server Component (page.jsx) because it needs
 * to call useSelector(), which requires the client runtime.
 */

import { useSelector } from 'react-redux';
import { selectCartItemCount } from '../store/cartSlice';

export default function CartBadgeDemo() {
  const count = useSelector(selectCartItemCount);

  if (count === 0) return null;

  return (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white text-brand-600 text-xs font-bold leading-none">
      {count > 99 ? '99+' : count}
    </span>
  );
}
