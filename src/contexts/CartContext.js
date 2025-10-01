import React, { createContext, useContext, useEffect, useState } from 'react';
import { ref, set, get, onValue } from 'firebase/database';
import { useAuth } from './AuthContext';
import { database } from '../firebase/config';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const { currentUser } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load cart from Firebase when user logs in
  useEffect(() => {
    if (currentUser) {
      const cartRef = ref(database, `users/${currentUser.uid}/cart`);
      const unsubscribe = onValue(cartRef, (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          console.log('[CartProvider] Cart loaded from Firebase:', val);
          if (Array.isArray(val)) {
            setCart(val.filter(Boolean)); // filter out nulls
          } else if (typeof val === 'object' && val !== null) {
            setCart(Object.values(val));
          } else {
            setCart([]);
          }
        } else {
          setCart([]);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Only clear cart if user logs out
      setCart([]);
      setLoading(false);
    }
  }, [currentUser]);

  // Save cart to Firebase whenever it changes
  useEffect(() => {
    if (currentUser) {
      console.log('[CartProvider] Writing cart to Firebase:', cart);
      set(ref(database, `users/${currentUser.uid}/cart`), cart)
        .then(() => console.log('[CartProvider] Cart write success'))
        .catch((err) => console.error('[CartProvider] Cart write error', err));
    }
  }, [cart, currentUser]);

  // Cart actions
  const addToCart = (product, selectedSize) => {
    console.log('[CartProvider] addToCart called. currentUser:', currentUser);
    setCart(prev => {
      let newCart;
      const existing = prev.find(
        item => item.id === product.id && item.selectedSize === selectedSize
      );
      if (existing) {
        newCart = prev.map(item =>
          item.id === product.id && item.selectedSize === selectedSize
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newCart = [...prev, { ...product, selectedSize, quantity: 1 }];
      }
      // Write to Firebase immediately
      if (currentUser) {
        set(ref(database, `users/${currentUser.uid}/cart`), newCart)
          .then(() => console.log('[CartProvider] Cart write success (immediate)', newCart))
          .catch((err) => console.error('[CartProvider] Cart write error (immediate)', err));
      }
      return newCart;
    });
  };

  const updateQuantity = (id, selectedSize, quantity) => {
    setCart(prev =>
      prev.map(item =>
        item.id === id && item.selectedSize === selectedSize
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeItem = (id, selectedSize) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.selectedSize === selectedSize)));
  };

  const clearCart = () => setCart([]);

  const value = {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
