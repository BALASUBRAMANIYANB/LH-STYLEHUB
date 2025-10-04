import React, { createContext, useContext, useEffect, useState } from 'react';
import { ref, set, onValue } from 'firebase/database';
import { useAuth } from './AuthContext';
import { database } from '../firebase/config';

const CartContext = createContext();

// Shallow-deep equality check to prevent redundant state updates from Firebase listener
const cartsEqual = (a, b) => {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch (_) {
    return false;
  }
};

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const { currentUser } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Load cart from Firebase when user logs in
  useEffect(() => {
    if (currentUser) {
      const cartRef = ref(database, `users/${currentUser.uid}/cart`);
      const unsubscribe = onValue(cartRef, (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          console.log('[CartProvider] Cart loaded from Firebase:', val);

          // Normalize incoming value to an array
          let incomingCart = [];
          if (Array.isArray(val)) {
            incomingCart = val.filter(Boolean); // filter out nulls
          } else if (typeof val === 'object' && val !== null) {
            incomingCart = Object.values(val);
          }

          // Avoid redundant state updates to prevent write/read loops
          setCart(prev => (cartsEqual(prev, incomingCart) ? prev : incomingCart));
        } else {
          setCart(prev => (prev.length === 0 ? prev : []));
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

  
  // Cart actions
  const addToCart = (product, selectedSize) => {
    console.log('[CartProvider] addToCart called. currentUser:', currentUser);

    // Show notification if user is not logged in
    if (!currentUser) {
      setNotification({
        type: 'warning',
        message: 'Please log in to save your cart items permanently. Items will be lost if you refresh the page.',
        duration: 5000
      });
      // Clear notification after duration
      setTimeout(() => setNotification(null), 5000);
    }

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
    setCart(prev => {
      const newCart = prev.map(item =>
        item.id === id && item.selectedSize === selectedSize
          ? { ...item, quantity }
          : item
      );
      if (currentUser) {
        set(ref(database, `users/${currentUser.uid}/cart`), newCart)
          .then(() => console.log('[CartProvider] Cart write success (updateQuantity)', newCart))
          .catch((err) => console.error('[CartProvider] Cart write error (updateQuantity)', err));
      }
      return newCart;
    });
  };

  const removeItem = (id, selectedSize) => {
    setCart(prev => {
      const newCart = prev.filter(item => !(item.id === id && item.selectedSize === selectedSize));
      if (currentUser) {
        set(ref(database, `users/${currentUser.uid}/cart`), newCart)
          .then(() => console.log('[CartProvider] Cart write success (removeItem)', newCart))
          .catch((err) => console.error('[CartProvider] Cart write error (removeItem)', err));
      }
      return newCart;
    });
  };

  const clearCart = () => {
    setCart(prev => {
      const newCart = [];
      if (currentUser) {
        set(ref(database, `users/${currentUser.uid}/cart`), newCart)
          .then(() => console.log('[CartProvider] Cart write success (clearCart)', newCart))
          .catch((err) => console.error('[CartProvider] Cart write error (clearCart)', err));
      }
      return newCart;
    });
  };

  const value = {
    cart,
    loading,
    notification,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    clearNotification: () => setNotification(null)
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
