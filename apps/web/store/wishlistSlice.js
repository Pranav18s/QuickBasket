/**
 * apps/web/store/wishlistSlice.js
 *
 * Redux slice for customer wishlist state.
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlist(state, action) {
      const product = action.payload;
      const index = state.items.findIndex(
        (item) => item.id === product.id || item.productId === product.productId || item.slug === product.slug
      );
      if (index >= 0) {
        state.items.splice(index, 1);
      } else {
        state.items.push(product);
      }
    },
    removeFromWishlist(state, action) {
      const idOrSlug = action.payload;
      state.items = state.items.filter(
        (item) => item.id !== idOrSlug && item.productId !== idOrSlug && item.slug !== idOrSlug
      );
    },
    clearWishlist(state) {
      state.items = [];
    },
  },
});

export const { toggleWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;

export const selectWishlistItems = (state) => state.wishlist.items;
export const selectWishlistCount = (state) => state.wishlist.items.length;
export const selectIsInWishlist = (idOrSlug) => (state) =>
  state.wishlist.items.some(
    (item) => item.id === idOrSlug || item.productId === idOrSlug || item.slug === idOrSlug
  );

export default wishlistSlice.reducer;
