import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Interface for a single item in the cart
export interface CartItem {
  id: string; // Unique ID for this specific cart entry (e.g., productId + hash of options)
  productId: string; // Original product ID
  name: string;
  quantity: number;
  price: number; // Price per unit for this configuration
  image?: string; // Optional image URL
  options?: Record<string, any>; // Selected configuration options
}

// Interface for the cart state
export interface CartState {
  items: CartItem[];
}

// Initial state for the cart
const initialState: CartState = {
  items: [],
  // Potential future additions: totalAmount, totalQuantity, etc. (derived state is often better computed with selectors)
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Add an item to the cart
    addItem(state, action: PayloadAction<CartItem>) {
      const newItem = action.payload;
      const existingItem = state.items.find(item => item.id === newItem.id);

      if (existingItem) {
        // If item with the same ID (product + options) exists, increase quantity
        existingItem.quantity += newItem.quantity;
      } else {
        // Otherwise, add the new item to the cart
        state.items.push(newItem);
      }
    },

    // Remove an item from the cart by its unique ID
    removeItem(state, action: PayloadAction<string>) {
      const idToRemove = action.payload;
      state.items = state.items.filter(item => item.id !== idToRemove);
    },

    // Update the quantity of a specific item in the cart
    updateItemQuantity(state, action: PayloadAction<{ id: string; quantity: number }>) {
      const { id, quantity } = action.payload;
      const itemToUpdate = state.items.find(item => item.id === id);

      if (itemToUpdate) {
        if (quantity > 0) {
          itemToUpdate.quantity = quantity;
        } else {
          // If quantity is 0 or less, remove the item
          state.items = state.items.filter(item => item.id !== id);
        }
      }
      // If item not found, do nothing (or potentially log an error)
    },

    // Clear all items from the cart
    clearCart(state) {
      state.items = [];
    },
  },
});

// Export actions for use in components
export const { addItem, removeItem, updateItemQuantity, clearCart } = cartSlice.actions;

// Export the reducer to be included in the store
export default cartSlice.reducer;

// Example Selector (can be placed here or in a separate selectors file)
// import { RootState } from '..'; // Adjust path to your root state definition
// export const selectCartItems = (state: RootState) => state.cart.items;
// export const selectCartTotalQuantity = (state: RootState) => 
//   state.cart.items.reduce((total, item) => total + item.quantity, 0);
// export const selectCartTotalAmount = (state: RootState) => 
//   state.cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

