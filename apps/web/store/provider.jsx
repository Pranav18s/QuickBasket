'use client';

/**
 * apps/web/store/provider.jsx
 *
 * Client Component that wraps the application in a Redux <Provider>.
 *
 * Why 'use client'?
 *   Redux's <Provider> uses React context, which requires a Client Component.
 *   This is the ONLY Redux-specific Client Component at the top level.
 *   All Server Components inside it can still be server-rendered normally.
 *
 * Cart persistence strategy (localStorage):
 *   - We load cart state from localStorage AFTER the component mounts
 *     (inside useEffect, which only runs in the browser).
 *   - This avoids the Next.js hydration mismatch that would occur if we
 *     tried to read localStorage during the initial server render or
 *     during React's first client-side render pass.
 *   - The brief flash of an empty cart on first paint is acceptable and
 *     is the standard pattern for localStorage-persisted Redux state.
 */

import { useRef, useEffect } from 'react';
import { Provider } from 'react-redux';
import { makeStore } from './index';
import { addItem } from './cartSlice';

const CART_STORAGE_KEY = 'qb_cart_items';

export default function StoreProvider({ children }) {
  // useRef ensures the store is only created once per browser session,
  // not re-created on every render.
  const storeRef = useRef(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  // Load persisted cart from localStorage after mount (client-only).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const items = JSON.parse(saved);
        if (Array.isArray(items) && items.length > 0) {
          items.forEach((item) => {
            storeRef.current.dispatch(addItem(item));
          });
        }
      }
    } catch {
      // Corrupted localStorage data — silently ignore and start fresh.
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, []); // Empty dep array = runs once after first render

  // Subscribe to store changes and persist cart to localStorage.
  useEffect(() => {
    const store = storeRef.current;
    const unsubscribe = store.subscribe(() => {
      try {
        const { cart } = store.getState();
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart.items));
      } catch {
        // localStorage may be full or disabled — fail silently.
      }
    });
    return unsubscribe; // Cleanup on unmount
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
