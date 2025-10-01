import React from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cart, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  const getCartTotal = () => cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  if (cart.length === 0) {
    return (
      <div className="cart-page-container">
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate('/products')}>Continue Shopping</button>
      </div>
    );
  }

  return (
    <div className="cart-page-container">
      <h2>Your Cart</h2>
      <div className="cart-items-list">
        {cart.map((item, index) => (
          <div key={`${item.id}-${item.selectedSize}-${index}`} className="cart-item-row">
            <img src={item.image} alt={item.name} style={{ width: 60, height: 60, objectFit: 'cover' }} />
            <div className="cart-item-info">
              <div><b>{item.name}</b></div>
              <div>Size: {item.selectedSize}</div>
              <div>Qty: 
                <button onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)} disabled={item.quantity <= 1}>-</button>
                <span style={{ margin: '0 8px' }}>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}>+</button>
              </div>
              <div>Price: Rs. {item.price} x {item.quantity} = <b>Rs. {(item.price * item.quantity).toFixed(2)}</b></div>
            </div>
            <button onClick={() => removeItem(item.id, item.selectedSize)} style={{ color: 'red', marginLeft: 16 }}>Remove</button>
          </div>
        ))}
      </div>
      <div className="cart-total-row">
        <h3>Total: Rs. {getCartTotal().toFixed(2)}</h3>
        <button onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
      </div>
    </div>
  );
};

export default Cart;