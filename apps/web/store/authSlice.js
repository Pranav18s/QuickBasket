/**
 * apps/web/store/authSlice.js
 *
 * Minimal client-side auth state.
 *
 * IMPORTANT DESIGN RULES:
 *   - This slice stores ONLY the display identity (name, role) derived from
 *     the API.  The backend is the authoritative source of truth for
 *     authentication and authorisation — never trust this slice for
 *     access control decisions.
 *   - On every page load, the app calls GET /api/v1/auth/me to verify the
 *     session cookie is still valid.  If it is, this slice is populated.
 *   - On logout, this slice is cleared and the session cookie is deleted
 *     by the API.
 *
 * State shape:
 * {
 *   user: null | { _id, name, email, role },
 *   isLoading: boolean,
 * }
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** Called when /auth/me returns successfully or after login. */
    setUser(state, action) {
      state.user = action.payload;
      state.isLoading = false;
    },

    /** Called on logout or when /auth/me returns 401. */
    clearUser(state) {
      state.user = null;
      state.isLoading = false;
    },

    /** Called while /auth/me is in flight on initial page load. */
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
  },
});

export const { setUser, clearUser, setLoading } = authSlice.actions;

// ── Selectors ────────────────────────────────────────────────────────────────
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.user !== null;
export const selectIsAdmin = (state) => state.auth.user?.role === 'admin';
export const selectAuthLoading = (state) => state.auth.isLoading;

export default authSlice.reducer;
