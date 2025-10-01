import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createOrder } from '../utils/orderUtils';
import { FaShoppingCart, FaUser, FaMapMarkerAlt, FaCreditCard, FaLock } from 'react-icons/fa';
import './Checkout.css';

const formatINR = (amount) => {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);
  } catch {
    return `₹${Number(amount).toFixed(2)}`;
  }
};

// Razorpay script loader
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = ({ onOrderComplete }) => {
  const { cart, clearCart } = useCart();
  // Razorpay payment handler
  const handleRazorpayPayment = async () => {
    setLoading(true);
    setError('');
    const res = await loadRazorpayScript();
    if (!res) {
      setError('Failed to load Razorpay SDK. Please try again.');
      setLoading(false);
      return;
    }
    // Ideally, order details should come from backend for security
    const options = {
      key: 'rzp_test_YourKeyHere', // Replace with your Razorpay Key ID
      amount: Math.round(getFinalTotal() * 100), // Amount in paise
      currency: 'INR',
      name: 'LH STYLEHUB',
      description: 'Order Payment',
      image: '/images/Logo/LH_Logo_White-01.png',
      handler: function (response) {
        // On successful payment
        handleSubmit();
      },
      prefill: {
        name: shippingInfo.firstName + ' ' + shippingInfo.lastName,
        email: shippingInfo.email,
        contact: shippingInfo.phone
      },
      theme: {
        color: '#333'
      }
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
    setLoading(false);
  };
  const navigate = useNavigate();
  const { currentUser, userProfile, addOrder } = useAuth();
  const [shippingInfo, setShippingInfo] = useState({
    firstName: userProfile?.firstName || '',
    lastName: userProfile?.lastName || '',
    email: userProfile?.email || '',
    phone: userProfile?.phone || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getShippingCost = () => {
    // Free shipping over ₹999, else flat ₹80
    return getCartTotal() > 999 ? 0 : 80;
  };

  const getTax = () => {
    // Prices are tax-inclusive for INR
    return 0;
  };

  const getFinalTotal = () => {
    return getCartTotal() + getShippingCost() + getTax();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('Please log in to complete your order');
      return;
    }

    if (cart.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create order object
  const order = createOrder(cart, userProfile, shippingInfo);
      
  // Add order to user's order history
  await addOrder(currentUser.uid, order);
  // Only clear cart after successful order
  clearCart();
  onOrderComplete && onOrderComplete(order);
  // Navigate to profile page to show order
  navigate('/profile');
    } catch (error) {
      console.error('Error creating order:', error);
      setError('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="checkout-container">
        <div className="checkout-content">
          <div className="auth-required">
            <FaUser />
            <h2>Authentication Required</h2>
            <p>Please log in to complete your checkout</p>
            <button 
              className="login-btn"
              onClick={() => navigate('/')}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="checkout-container">
        <div className="checkout-content">
          <div className="empty-cart">
            <FaShoppingCart />
            <h2>Your Cart is Empty</h2>
            <p>Add some items to your cart before checkout</p>
            <button 
              className="shop-btn"
              onClick={() => navigate('/products')}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-content">
        <div className="checkout-header">
          <h1>Checkout</h1>
          <p>Complete your order</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="checkout-sections">
          {/* Order Summary */}
          <div className="checkout-section">
            <h2>Order Summary</h2>
            <div className="order-items">
              {cart.map((item, index) => (
                <div key={`${item.id}-${item.selectedSize}-${index}`} className="order-item">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="item-image"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/60x60?text=Image';
                    }}
                  />
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p>Size: {item.selectedSize}</p>
                    <p>Quantity: {item.quantity}</p>
                  </div>
                  <div className="item-price">
                    {formatINR(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Information */}
          <div className="checkout-section">
            <h2>Shipping Information</h2>
            <form onSubmit={handleSubmit} className="shipping-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">
                    <FaUser /> First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={shippingInfo.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">
                    <FaUser /> Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={shippingInfo.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">
                    <FaUser /> Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={shippingInfo.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">
                    <FaUser /> Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={shippingInfo.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address">
                  <FaMapMarkerAlt /> Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={shippingInfo.address}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">
                    <FaMapMarkerAlt /> City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="state">
                    <FaMapMarkerAlt /> State
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={shippingInfo.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="zipCode">
                    <FaMapMarkerAlt /> ZIP Code
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={shippingInfo.zipCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="country">
                    <FaMapMarkerAlt /> Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={shippingInfo.country}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>


              {/* Payment Section - COD */}
              <div className="checkout-section">
                <h2>Payment Information</h2>
                <div className="payment-placeholder">
                  <FaCreditCard />
                  <p>Pay with <b>Cash on Delivery (COD)</b></p>
                  <button
                    type="submit"
                    className="cod-btn"
                    disabled={loading}
                    style={{marginTop: '1rem', padding: '0.7rem 1.5rem', background: '#333', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer'}}
                  >
                    {loading ? 'Placing Order...' : 'Place Order (COD)'}
                  </button>
                </div>
              </div>

              {/* Order Total */}
              <div className="order-total-section">
                <h3>Order Total</h3>
                <div className="total-breakdown">
                  <div className="total-row">
                    <span>Subtotal:</span>
                    <span>{formatINR(getCartTotal())}</span>
                  </div>
                  <div className="total-row">
                    <span>Shipping:</span>
                    <span>{getShippingCost() === 0 ? 'Free' : formatINR(getShippingCost())}</span>
                  </div>
                  <div className="total-row">
                    <span>Tax:</span>
                    <span>{formatINR(getTax())}</span>
                  </div>
                  <div className="total-row total-final">
                    <span>Total:</span>
                    <span>{formatINR(getFinalTotal())}</span>
                  </div>
                </div>
              </div>

              {/* Hide Place Order button, payment is handled by Razorpay */}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
