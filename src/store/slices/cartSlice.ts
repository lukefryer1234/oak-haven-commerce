import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import { Cart, CartItem, ProductCategory } from '../../types';
import { RootState } from '../index';

// Initial state
const initialState: Cart = {
  items: [],
  subtotal: 0,
  vatAmount: 0,
  shippingCost: 0,
  total: 0,
};

// Helper functions
const calculateCartTotals = (items: CartItem[], vatRate: number = 0.20, shippingCost: number = 0): Cart => {
  const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const vatAmount = subtotal * vatRate;
  const total = subtotal + vatAmount + shippingCost;

  return {
    items,
    subtotal,
    vatAmount,
    shippingCost,
    total,
  };
};

// Create slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<Omit<CartItem, 'id'>>) => {
      const newItem = {
        ...action.payload,
        id: uuidv4(),
      };
      
      state.items.push(newItem);
      
      const updatedCart = calculateCartTotals(state.items, 0.20, state.shippingCost);
      state.subtotal = updatedCart.subtotal;
      state.vatAmount = updatedCart.vatAmount;
      state.total = updatedCart.total;
    },
    
    updateItemQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload;
      const itemIndex = state.items.findIndex(item => item.id === id);
      
      if (itemIndex !== -1) {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          state.items.splice(itemIndex, 1);
        } else {
          // Update quantity
          state.items[itemIndex].quantity = quantity;
        }
        
        const updatedCart = calculateCartTotals(state.items, 0.20, state.shippingCost);
        state.subtotal = updatedCart.subtotal;
        state.vatAmount = updatedCart.vatAmount;
        state.total = updatedCart.total;
      }
    },
    
    removeItem: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.items = state.items.filter(item => item.id !== id);
      
      const updatedCart = calculateCartTotals(state.items, 0.20, state.shippingCost);
      state.subtotal = updatedCart.subtotal;
      state.vatAmount = updatedCart.vatAmount;
      state.total = updatedCart.total;
    },
    
    updateItemOptions: (state, action: PayloadAction<{ id: string; options: any; unitPrice: number }>) => {
      const { id, options, unitPrice } = action.payload;
      const itemIndex = state.items.findIndex(item => item.id === id);
      
      if (itemIndex !== -1) {
        state.items[itemIndex].options = options;
        state.items[itemIndex].unitPrice = unitPrice;
        
        const updatedCart = calculateCartTotals(state.items, 0.20, state.shippingCost);
        state.subtotal = updatedCart.subtotal;
        state.vatAmount = updatedCart.vatAmount;
        state.total = updatedCart.total;
      }
    },
    
    setShippingCost: (state, action: PayloadAction<number>) => {
      state.shippingCost = action.payload;
      
      const updatedCart = calculateCartTotals(state.items, 0.20, action.payload);
      state.total = updatedCart.total;
    },
    
    clearCart: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.vatAmount = 0;
      state.shippingCost = 0;
      state.total = 0;
    },
    
    calculateShipping: (state, action: PayloadAction<{
      freeDeliveryThreshold: number;
      minDeliveryCharge: number;
      shippingRatePerCubicMeter: number;
    }>) => {
      const { freeDeliveryThreshold, minDeliveryCharge, shippingRatePerCubicMeter } = action.payload;
      
      // Free shipping if subtotal is over threshold
      if (state.subtotal >= freeDeliveryThreshold) {
        state.shippingCost = 0;
      } else {
        // Calculate total volume for beams and flooring items
        let totalVolume = 0;
        
        state.items.forEach(item => {
          if (item.category === ProductCategory.OAK_BEAM) {
            // For beams, calculate volume from dimensions
            const { length, width, thickness } = item.options.dimensions;
            // Convert cm to m and calculate volume
            const volumeInCubicMeters = (length / 100) * (width / 100) * (thickness / 100) * item.quantity;
            totalVolume += volumeInCubicMeters;
          } else if (item.category === ProductCategory.OAK_FLOORING) {
            // For flooring, calculate volume from area and thickness
            const area = item.options.area; // Already in m²
            const thickness = item.options.thickness / 1000; // Convert mm to m
            const volumeInCubicMeters = area * thickness * item.quantity;
            totalVolume += volumeInCubicMeters;
          }
          // Other product types (Garages, Gazebos, Porches) have delivery included in price
        });
        
        // Calculate shipping based on volume
        if (totalVolume > 0) {
          // Calculate based on volume and rate, but never less than minimum charge
          const calculatedShipping = totalVolume * shippingRatePerCubicMeter;
          state.shippingCost = Math.max(calculatedShipping, minDeliveryCharge);
        } else {
          // If no shippable items (only garages/gazebos/porches), cost is 0 as shipping is included
          state.shippingCost = 0;
        }
      }
      
      // Update total
      const updatedCart = calculateCartTotals(state.items, 0.20, state.shippingCost);
      state.total = updatedCart.total;
    },
  },
});

// Selectors
export const selectCartItems = (state: RootState) => state.cart.items;
export const selectCartItemsCount = (state: RootState) => state.cart.items.reduce((count, item) => count + item.quantity, 0);
export const selectCartTotals = (state: RootState) => ({
  subtotal: state.cart.subtotal,
  vatAmount: state.cart.vatAmount,
  shippingCost: state.cart.shippingCost,
  total: state.cart.total
});

export const selectCartItemById = (id: string) =>
  createSelector(
    [selectCartItems],
    (items) => items.find(item => item.id === id)
  );

// Additional selectors for product categories
export const selectProductCategoryItems = (category: ProductCategory) =>
  createSelector(
    [selectCartItems],
    (items) => items.filter(item => item.category === category)
  );

// Volume calculation helpers for shipping
export const calculateBeamVolume = (dimensions: { length: number; width: number; thickness: number }, quantity: number) => {
  return (dimensions.length / 100) * (dimensions.width / 100) * (dimensions.thickness / 100) * quantity;
};

export const calculateFlooringVolume = (area: number, thickness: number, quantity: number) => {
  return area * (thickness / 1000) * quantity; // thickness in mm to m
};

// Export actions and reducer
export const { 
  addItem, 
  updateItemQuantity, 
  removeItem, 
  updateItemOptions, 
  setShippingCost, 
  clearCart, 
  calculateShipping 
} = cartSlice.actions;

export default cartSlice.reducer;
