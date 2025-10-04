import React from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaTrash, FaArrowRight, FaMinus, FaPlus, FaUser } from 'react-icons/fa';
import './Cart.css';

const Cart = () => {
  const { cart, updateQuantity, removeItem } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const getCartTotal = () => cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Show login prompt for guest users
  if (!currentUser) {
    return (
      <div className="cart-page-container">
        <div className="cart-empty">
          <FaUser />
          <h2>Login to Continue</h2>
          <p>Please log in to add products to your cart and place orders</p>
          <button className="continue-shopping-btn" onClick={() => navigate('/')}>
            <FaArrowRight /> Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="cart-page-container">
        <div className="cart-empty">
          <FaShoppingCart />
          <h2>Your cart is empty</h2>
          <p>Add some items to your cart before proceeding</p>
          <button className="continue-shopping-btn" onClick={() => navigate('/t-shirts')}>
            <FaArrowRight /> Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-container">
      <h2>Your Cart</h2>
      <div className="cart-items-list">
        {cart.map((item, index) => (
          <div key={`${item.id}-${item.selectedSize}-${index}`} className="cart-item-row">
            <img
              src={item.image}
              alt={item.name}
              className="cart-item-image"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/80x80?text=Image';
              }}
            />
            <div className="cart-item-info">
              <h3 className="cart-item-name">{item.name}</h3>
              <div className="cart-item-details">
                <div>Size: {item.selectedSize}</div>
                <div className="cart-quantity-controls">
                  <span>Qty:</span>
                  <button
                    className="quantity-btn"
                    onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <FaMinus />
                  </button>
                  <span className="quantity-value">{item.quantity}</span>
                  <button
                    className="quantity-btn"
                    onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                  >
                    <FaPlus />
                  </button>
                </div>
                <div className="cart-item-price">
                  Rs. {item.price.toLocaleString()} x {item.quantity} = Rs. {(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            </div>
            <button className="remove-btn" onClick={() => removeItem(item.id, item.selectedSize)}>
              <FaTrash /> Remove
            </button>
          </div>
        ))}
      </div>
      <div className="cart-total-row">
        <div className="cart-total-amount">
          Total: Rs. {getCartTotal().toLocaleString()}
        </div>
        <button className="checkout-btn" onClick={() => navigate('/checkout')}>
          Proceed to Checkout <FaArrowRight />
        </button>
      </div>
    </div>
  );
};

export default Cart;