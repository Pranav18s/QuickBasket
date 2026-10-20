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
import { toggleWishlist } from './wishlistSlice';
import { setUser } from './authSlice';

const CART_STORAGE_KEY = 'qb_cart_items';
const WISHLIST_STORAGE_KEY = 'qb_wishlist_items';
const USER_STORAGE_KEY = 'qb_demo_user';

export default function StoreProvider({ children }) {
  // useRef ensures the store is only created once per browser session,
  // not re-created on every render.
  const storeRef = useRef(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  // Load persisted cart, wishlist, and demo user from localStorage after mount (client-only).
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const items = JSON.parse(savedCart);
        if (Array.isArray(items) && items.length > 0) {
          items.forEach((item) => {
            storeRef.current.dispatch(addItem(item));
          });
        }
      }

      const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (savedWishlist) {
        const wishItems = JSON.parse(savedWishlist);
        if (Array.isArray(wishItems) && wishItems.length > 0) {
          wishItems.forEach((w) => {
            storeRef.current.dispatch(toggleWishlist(w));
          });
        }
      }

      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (savedUser) {
        storeRef.current.dispatch(setUser(JSON.parse(savedUser)));
      } else {
        // Default demo customer logged in for smooth portfolio testing
        const defaultDemoUser = {
          id: 'user_1',
          name: 'Arjun Nair',
          email: 'customer@quickbasket.demo',
          role: 'customer',
        };
        storeRef.current.dispatch(setUser(defaultDemoUser));
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(defaultDemoUser));
      }
    } catch {
      // Corrupted localStorage data — silently ignore and start fresh.
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(WISHLIST_STORAGE_KEY);
    }
  }, []); // Empty dep array = runs once after first render

  // Subscribe to store changes and persist cart & wishlist to localStorage.
  useEffect(() => {
    const store = storeRef.current;
    const unsubscribe = store.subscribe(() => {
      try {
        const { cart, wishlist, auth } = store.getState();
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart.items));
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist.items));
        if (auth.user) {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(auth.user));
        } else {
          localStorage.removeItem(USER_STORAGE_KEY);
        }
      } catch {
        // localStorage may be full or disabled — fail silently.
      }
    });
    return unsubscribe; // Cleanup on unmount
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
