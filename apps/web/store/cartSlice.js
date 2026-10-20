/**
 * apps/web/store/cartSlice.js
 *
 * Redux slice for the shopping cart.
 *
 * IMPORTANT DESIGN RULES (per MASTER_PROJECT_PROMPT.md §7):
 *   1. The cart stores product IDs, quantities, and minimal display data
 *      (name, pricePaise, image, packageSize, slug).
 *   2. Cart prices are NOT authoritative.  The backend MUST re-validate
 *      prices and stock when an order is created.
 *   3. Duplicate products are merged — adding an existing item increases qty.
 *   4. Quantities cannot go below 1; use removeItem to delete a line.
 *
 * State shape:
 * {
 *   items: [
 *     {
 *       productId: string,   // MongoDB ObjectId string
 *       slug: string,        // for linking to product page
 *       name: string,
 *       pricePaise: number,  // integer paise — display as ₹(pricePaise/100)
 *       image: string,
 *       packageSize: string, // e.g. "1 kg"
 *       quantity: number,    // integer ≥ 1
 *     }
 *   ]
 * }
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    /**
     * Add a product to the cart.
     * If the product already exists, increase its quantity.
     *
     * payload: {
     *   productId, slug, name, pricePaise, image, packageSize, quantity?
     * }
     */
    addItem(state, action) {
      const { productId, quantity = 1, ...displayData } = action.payload;
      const existing = state.items.find((item) => item.productId === productId);
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({ productId, quantity, ...displayData });
      }
    },

    /**
     * Remove a product from the cart entirely.
     * payload: productId (string)
     */
    removeItem(state, action) {
      state.items = state.items.filter((item) => item.productId !== action.payload);
    },

    /**
     * Set the quantity of a cart item explicitly.
     * Silently ignored if the product is not in the cart.
     * Quantities below 1 are clamped to 1 — use removeItem to delete.
     *
     * payload: { productId: string, quantity: number }
     */
    updateQuantity(state, action) {
      const { productId, quantity } = action.payload;
      const item = state.items.find((i) => i.productId === productId);
      if (item) {
        item.quantity = Math.max(1, quantity);
      }
    },

    /**
     * Remove all items from the cart.
     * Called after a successful order is placed.
     */
    clearCart(state) {
      state.items = [];
    },
  },
});

export const { addItem, removeItem, updateQuantity, clearCart } = cartSlice.actions;

// ── Selectors ────────────────────────────────────────────────────────────────

/** Total number of individual units in the cart (sum of all quantities). */
export const selectCartItemCount = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);

/** Cart subtotal in paise (integer). Divide by 100 to display in ₹. */
export const selectCartSubtotalPaise = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.pricePaise * item.quantity, 0);

/** All cart items. */
export const selectCartItems = (state) => state.cart.items;

export default cartSlice.reducer;
