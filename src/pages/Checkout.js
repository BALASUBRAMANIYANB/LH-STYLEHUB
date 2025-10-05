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
    const razorpayKey = process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_live_ROYxFzNDDRuwWs'; // Fallback to direct key
    console.log('Razorpay Key:', razorpayKey); // Debug log

    if (!razorpayKey) {
      setError('Razorpay key not configured. Please contact support.');
      setLoading(false);
      return;
    }

    const res = await loadRazorpayScript();
    if (!res) {
      setError('Failed to load Razorpay SDK. Please try again.');
      setLoading(false);
      return;
    }

    // Override console.error to suppress Razorpay UPI launch errors
    const originalConsoleError = console.error;
    console.error = function(...args) {
      // Suppress specific Razorpay UPI launch errors
      if (args[0] && typeof args[0] === 'string' &&
          (args[0].includes('Failed to launch') || args[0].includes('gpay://'))) {
        return; // Suppress this error
      }
      originalConsoleError.apply(console, args);
    };
    // Ideally, order details should come from backend for security
    const options = {
      key: razorpayKey, // Razorpay Key ID from environment
      amount: Math.round(getFinalTotal() * 100), // Amount in paise
      currency: 'INR',
      name: 'LH STYLEHUB',
      description: 'Order Payment',
      image: '/images/Logo/LH_Logo_White-01.png',
      handler: function (response) {
        // On successful payment, process the order
        processOrderAfterPayment();
      },
      prefill: {
        name: shippingInfo.firstName + ' ' + shippingInfo.lastName,
        email: shippingInfo.email,
        contact: shippingInfo.phone
      },
      theme: {
        color: '#333'
      },
      modal: {
        ondismiss: function() {
          console.log('Payment modal dismissed');
        }
      }
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
    setLoading(false);

    // Restore original console.error after modal closes
    setTimeout(() => {
      console.error = originalConsoleError;
    }, 10000); // Restore after 10 seconds
  };
  const navigate = useNavigate();
  const { currentUser, userProfile, addOrder, updateOrder } = useAuth();
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
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'online' or 'cod'
  const [formErrors, setFormErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!shippingInfo.firstName.trim()) errors.firstName = 'First name is required';
    if (!shippingInfo.lastName.trim()) errors.lastName = 'Last name is required';
    if (!shippingInfo.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(shippingInfo.email)) errors.email = 'Email is invalid';
    if (!shippingInfo.phone.trim()) errors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(shippingInfo.phone.replace(/\D/g, ''))) errors.phone = 'Phone number must be 10 digits';
    if (!shippingInfo.address.trim()) errors.address = 'Address is required';
    if (!shippingInfo.city.trim()) errors.city = 'City is required';
    if (!shippingInfo.state.trim()) errors.state = 'State is required';
    if (!shippingInfo.zipCode.trim()) errors.zipCode = 'ZIP code is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getShippingCost = () => {
    // Free shipping over ₹999, else flat ₹79
    return getCartTotal() > 999 ? 0 : 79;
  };

  const getTax = () => {
    // Prices are tax-inclusive for INR
    return 0;
  };

  const getFinalTotal = () => {
    return getCartTotal() + getShippingCost() + getTax();
  };

  const processOrderAfterPayment = async () => {
    try {
      // Create order object
      const shippingCost = getShippingCost();
      const taxAmount = getTax();
      const order = createOrder(cart, userProfile, shippingInfo, shippingCost, taxAmount);
      order.paymentMethod = paymentMethod; // Add payment method to order

      // Persist order and verify success
      const orderKey = await addOrder(currentUser.uid, order);
      if (!orderKey) {
        throw new Error('Order save failed');
      }

      // Automatically create shipment on Shiprocket
      try {
        console.log('Attempting to create shipment for order:', orderKey);
        console.log('Shipment API URL:', '/api/create-shipment');
        console.log('Order data being sent:', { order: { ...order, id: orderKey } });

        const shipmentResponse = await fetch('/api/create-shipment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: { ...order, id: orderKey } })
        });

        console.log('Shipment API response status:', shipmentResponse.status);
        console.log('Shipment API response headers:', Object.fromEntries(shipmentResponse.headers.entries()));

        if (shipmentResponse.ok) {
          const shipmentData = await shipmentResponse.json();
          console.log('Shipment created successfully:', shipmentData);

          // Update order with shipment details
          const shipmentUpdate = {
            shipment: {
              awb: shipmentData.awb_code || shipmentData.awb,
              shipmentId: shipmentData.shipment_id || shipmentData.order_id,
              courier: shipmentData.courier_name || 'Shiprocket',
              trackingUrl: shipmentData.track_url || `https://shiprocket.co/tracking/${shipmentData.awb_code}`,
              createdAt: new Date().toISOString()
            }
          };

          console.log('Updating order with shipment data:', shipmentUpdate);
          await updateOrder(currentUser.uid, orderKey, shipmentUpdate);
          // Update order object for emails
          order.shipment = shipmentUpdate.shipment;
          console.log('Order updated successfully with shipment details');
        } else {
          const errorText = await shipmentResponse.text();
          console.error('Shipment creation failed with status:', shipmentResponse.status, 'Response:', errorText);

          // Create a fallback shipment entry for manual processing
          const fallbackShipment = {
            shipment: {
              awb: 'PENDING',
              shipmentId: 'MANUAL_PROCESSING',
              courier: 'To be assigned',
              trackingUrl: '',
              createdAt: new Date().toISOString(),
              status: 'pending_shipment_creation'
            }
          };

          console.log('Creating fallback shipment entry:', fallbackShipment);
          await updateOrder(currentUser.uid, orderKey, fallbackShipment);
          order.shipment = fallbackShipment.shipment;
        }
      } catch (shipmentError) {
        console.error('Error creating shipment:', shipmentError);

        // Create a fallback shipment entry for manual processing
        const fallbackShipment = {
          shipment: {
            awb: 'PENDING',
            shipmentId: 'MANUAL_PROCESSING',
            courier: 'To be assigned',
            trackingUrl: '',
            createdAt: new Date().toISOString(),
            status: 'pending_shipment_creation'
          }
        };

        console.log('Creating fallback shipment entry due to error:', fallbackShipment);
        await updateOrder(currentUser.uid, orderKey, fallbackShipment);
        order.shipment = fallbackShipment.shipment;
      }

      // Send order confirmation email to customer
      try {
        await fetch('/api/send-order-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order })
        });
      } catch (emailError) {
        console.error('Error sending order confirmation email:', emailError);
      }

      // Send notification email to seller/admin
      try {
        await fetch('/api/send-seller-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order, customerEmail: currentUser.email })
        });
      } catch (emailError) {
        console.error('Error sending seller notification email:', emailError);
      }

      // Persist a backup for confirmation page
      try { sessionStorage.setItem('lastOrder', JSON.stringify({ ...order, id: orderKey })); } catch {}
      // Clear cart only after order saved
      clearCart();
      onOrderComplete && onOrderComplete(order);
      // Navigate to order confirmation page with state
      navigate('/order-confirmation', { state: { order: { ...order, id: orderKey } } });
    } catch (error) {
      console.error('Error creating order:', error);
      setError('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
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

    if (!validateForm()) {
      setError('Please correct the errors below');
      return;
    }

    setLoading(true);
    setError('');

    if (paymentMethod === 'online') {
      // Handle online payment with Razorpay
      await handleRazorpayPayment();
    } else {
      // Handle COD - proceed directly
      await processOrderAfterPayment();
    }
  };

  if (!currentUser) {
    return (
      <div className="checkout-container">
        <div className="checkout-content">
          <div className="auth-required">
            <FaUser />
            <h2>Authentication Required</h2>
            <p>Please log in to complete your order</p>
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
        {/* Progress Indicator */}
        <div className="checkout-progress">
          <div className="progress-step active">
            <div className="step-number">1</div>
            <div className="step-label">Cart</div>
          </div>
          <div className="progress-line active"></div>
          <div className="progress-step active">
            <div className="step-number">2</div>
            <div className="step-label">Shipping</div>
          </div>
          <div className="progress-line active"></div>
          <div className="progress-step active">
            <div className="step-number">3</div>
            <div className="step-label">Payment</div>
          </div>
        </div>

        <div className="checkout-header">
          <h1>Secure Checkout</h1>
          <p>Complete your order with confidence</p>
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
                    className={formErrors.firstName ? 'error' : ''}
                  />
                  {formErrors.firstName && <span className="field-error">{formErrors.firstName}</span>}
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
                    className={formErrors.lastName ? 'error' : ''}
                  />
                  {formErrors.lastName && <span className="field-error">{formErrors.lastName}</span>}
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
                    className={formErrors.email ? 'error' : ''}
                  />
                  {formErrors.email && <span className="field-error">{formErrors.email}</span>}
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
                    className={formErrors.phone ? 'error' : ''}
                  />
                  {formErrors.phone && <span className="field-error">{formErrors.phone}</span>}
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
                  className={formErrors.address ? 'error' : ''}
                />
                {formErrors.address && <span className="field-error">{formErrors.address}</span>}
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
                    className={formErrors.city ? 'error' : ''}
                  />
                  {formErrors.city && <span className="field-error">{formErrors.city}</span>}
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
                    className={formErrors.state ? 'error' : ''}
                  />
                  {formErrors.state && <span className="field-error">{formErrors.state}</span>}
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
                    className={formErrors.zipCode ? 'error' : ''}
                  />
                  {formErrors.zipCode && <span className="field-error">{formErrors.zipCode}</span>}
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


              {/* Payment Section */}
              <div className="checkout-section">
                <h2>Payment Information</h2>
                <div className="payment-methods">
                  <div className="payment-method">
                    <input
                      type="radio"
                      id="online"
                      name="paymentMethod"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label htmlFor="online">
                      <FaCreditCard />
                      <div>
                        <strong>Online Payment</strong>
                        <p>Pay securely with Razorpay</p>
                      </div>
                    </label>
                  </div>
                  <div className="payment-method">
                    <input
                      type="radio"
                      id="cod"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label htmlFor="cod">
                      <FaLock />
                      <div>
                        <strong>Cash on Delivery (COD)</strong>
                        <p>Pay when you receive your order</p>
                      </div>
                    </label>
                  </div>
                </div>
                <button
                  type="submit"
                  className="place-order-btn"
                  disabled={loading}
                  style={{marginTop: '1rem', padding: '0.7rem 1.5rem', background: '#333', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', width: '100%'}}
                >
                  {loading ? 'Processing...' : paymentMethod === 'online' ? 'Pay Now' : 'Place Order (COD)'}
                </button>
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
