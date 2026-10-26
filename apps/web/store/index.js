/**
 * apps/web/store/index.js
 *
 * Redux store factory for QuickBasket 2026.
 *
 * WHY a factory function instead of a singleton?
 * ───────────────────────────────────────────────
 * Next.js App Router renders pages on the server for every request.
 * If we exported a single shared store, it would accumulate state from
 * multiple users' server-side renders — a serious security bug.
 *
 * The `makeStore` factory creates a fresh store instance per call.
 * The `StoreProvider` (store/provider.jsx) calls `makeStore()` once per
 * browser session using a React ref, so the client still gets a stable
 * singleton between navigations.
 *
 * Reference: Redux Toolkit docs — "Usage with Next.js App Router".
 */

import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import authReducer from './authSlice';
import wishlistReducer from './wishlistSlice';

/**
 * Factory function.  Call once per browser session (via StoreProvider).
 * @param {object} [preloadedState] - Optional initial state (e.g. from SSR).
 * @returns {import('@reduxjs/toolkit').EnhancedStore}
 */
export function makeStore(preloadedState = {}) {
  return configureStore({
    reducer: {
      cart: cartReducer,
      auth: authReducer,
      wishlist: wishlistReducer,
    },
    preloadedState,
  });
}
