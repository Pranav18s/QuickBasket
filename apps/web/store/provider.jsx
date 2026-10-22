'use client';

import { useRef, useEffect } from 'react';
import { Provider } from 'react-redux';
import { makeStore } from './index';
import { addItem } from './cartSlice';
import { toggleWishlist } from './wishlistSlice';
import { clearUser, setUser } from './authSlice';

const CART_STORAGE_KEY = 'qb_cart_items';
const WISHLIST_STORAGE_KEY = 'qb_wishlist_items';

export default function StoreProvider({ children }) {
  const storeRef = useRef(null);
  if (!storeRef.current) storeRef.current = makeStore();

  useEffect(() => {
    const store = storeRef.current;
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const items = JSON.parse(savedCart);
        if (Array.isArray(items)) items.forEach((item) => store.dispatch(addItem(item)));
      }

      const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (savedWishlist) {
        const items = JSON.parse(savedWishlist);
        if (Array.isArray(items)) items.forEach((item) => store.dispatch(toggleWishlist(item)));
      }
    } catch {
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(WISHLIST_STORAGE_KEY);
    }

    // The server, not localStorage or Redux, is the authority for identity.
    fetch('/api/v1/auth/me', { credentials: 'same-origin' })
      .then(async (response) => {
        if (!response.ok) throw new Error('No active session');
        const payload = await response.json();
        if (!payload.success || !payload.data?.user) throw new Error('Invalid session response');
        store.dispatch(setUser(payload.data.user));
      })
      .catch(() => store.dispatch(clearUser()));
  }, []);

  useEffect(() => {
    const store = storeRef.current;
    const unsubscribe = store.subscribe(() => {
      try {
        const { cart, wishlist } = store.getState();
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart.items));
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist.items));
      } catch {
        // Browser storage may be unavailable or full; the in-memory state still works.
      }
    });
    return unsubscribe;
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
