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
    if (!currentUser) {
      setCart([]);
      setLoading(false);
      return;
    }
    const cartRef = ref(database, `users/${currentUser.uid}/cart`);
    const unsubscribe = onValue(cartRef, (snapshot) => {
      if (snapshot.exists()) {
        setCart(snapshot.val());
      } else {
        setCart([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Save cart to Firebase whenever it changes
  useEffect(() => {
    if (currentUser) {
      set(ref(database, `users/${currentUser.uid}/cart`), cart);
    }
  }, [cart, currentUser]);

  // Cart actions
  const addToCart = (product, selectedSize) => {
    setCart(prev => {
      const existing = prev.find(
        item => item.id === product.id && item.selectedSize === selectedSize
      );
      if (existing) {
        return prev.map(item =>
          item.id === product.id && item.selectedSize === selectedSize
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { ...product, selectedSize, quantity: 1 }];
      }
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
