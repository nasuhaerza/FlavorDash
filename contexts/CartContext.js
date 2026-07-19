/**
 * contexts/CartContext.js
 * Manajemen state keranjang belanja global
 *
 * Menyediakan: { cart, addToCart, removeFromCart, updateQty, clearCart, cartTotal, cartCount }
 */

import { createContext, useCallback, useContext, useReducer } from 'react';

const CartContext = createContext(null);

// -------------------------------------------------------
// Reducer — semua operasi cart dikelola di sini
// -------------------------------------------------------
function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.find((i) => i.id === action.item.id);
      if (existing) {
        return state.map((i) =>
          i.id === action.item.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...state, { ...action.item, qty: 1 }];
    }
    case 'REMOVE_ITEM':
      return state.filter((i) => i.id !== action.id);
    case 'UPDATE_QTY':
      if (action.qty <= 0) return state.filter((i) => i.id !== action.id);
      return state.map((i) =>
        i.id === action.id ? { ...i, qty: action.qty } : i
      );
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

// -------------------------------------------------------
// CartProvider
// -------------------------------------------------------
export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, []);

  const addToCart = useCallback((item) => {
    dispatch({ type: 'ADD_ITEM', item });
  }, []);

  const removeFromCart = useCallback((id) => {
    dispatch({ type: 'REMOVE_ITEM', id });
  }, []);

  const updateQty = useCallback((id, qty) => {
    dispatch({ type: 'UPDATE_QTY', id, qty });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  // Total harga semua item di cart
  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  // Jumlah total item di cart
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQty, clearCart, cartTotal, cartCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

// -------------------------------------------------------
// Custom hook
// -------------------------------------------------------
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart harus di dalam CartProvider');
  return context;
}
