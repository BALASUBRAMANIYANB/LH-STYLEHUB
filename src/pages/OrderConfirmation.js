import React, { useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../utils/orderUtils';
import { FaCheckCircle, FaTruck, FaMapMarkerAlt, FaCreditCard, FaShoppingBag } from 'react-icons/fa';
import './OrderTracking.css';

const OrderConfirmation = () => {
  const location = useLocation();

  const orderFromState = location.state && location.state.order ? location.state.order : null;

  // Fallback: attempt to read from sessionStorage if available
  const order = useMemo(() => {
    if (orderFromState) return orderFromState;
    try {
      const raw = sessionStorage.getItem('lastOrder');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [orderFromState]);

  if (!order) {
    return (
      <div className="order-tracking-container">
        <h2>Order Confirmation</h2>
        <div className="error-message">No order details found.</div>
        <p>
          <Link to="/products">Continue Shopping</Link> or <Link to="/profile">Go to Profile</Link>
        </p>
      </div>
    );
  }

  const subtotal = order.subtotal || (order.items ? order.items.reduce((s, i) => s + i.price * i.quantity, 0) : 0);
  const shippingCost = order.shippingCost || 0;
  const tax = order.tax || 0;
  const total = order.total || (subtotal + shippingCost + tax);

  return (
    <div className="order-confirmation-container">
      <div className="confirmation-header">
        <div className="success-icon">
          <FaCheckCircle />
        </div>
        <h1>Order Confirmed!</h1>
        <p>Thank you for shopping with LH STYLEHUB</p>
      </div>

      <div className="confirmation-content">
        {/* Order Details */}
        <div className="confirmation-section">
          <h2><FaShoppingBag /> Order Details</h2>
          <div className="order-info-grid">
            <div className="info-item">
              <span className="label">Order ID:</span>
              <span className="value">{order.orderId || order.id || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="label">Order Date:</span>
              <span className="value">{formatDate(order.orderDate)}</span>
            </div>
            <div className="info-item">
              <span className="label">Payment Method:</span>
              <span className="value">{order.paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery'}</span>
            </div>
            <div className="info-item">
              <span className="label">Estimated Delivery:</span>
              <span className="value">{order.estimatedDelivery ? formatDate(order.estimatedDelivery) : '7-10 business days'}</span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="confirmation-section">
          <h2>Order Items</h2>
          <div className="order-items-list">
            {order.items && order.items.map((item, idx) => (
              <div key={idx} className="order-item-card">
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
                  <p>Size: {item.selectedSize} | Quantity: {item.quantity}</p>
                  <p className="item-price">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="confirmation-section">
          <h2><FaMapMarkerAlt /> Shipping Address</h2>
          <div className="address-display">
            <p><strong>{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</strong></p>
            <p>{order.shippingAddress?.address}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
            <p>{order.shippingAddress?.country}</p>
            <p><strong>Phone:</strong> {order.shippingAddress?.phone}</p>
            <p><strong>Email:</strong> {order.shippingAddress?.email}</p>
          </div>
        </div>

        {/* Order Total */}
        <div className="confirmation-section order-total-section">
          <h2><FaCreditCard /> Order Total</h2>
          <div className="total-breakdown">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="total-row">
              <span>Shipping:</span>
              <span>{shippingCost === 0 ? 'Free' : formatCurrency(shippingCost)}</span>
            </div>
            <div className="total-row">
              <span>Tax:</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="total-row total-final">
              <span>Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Shipping Info */}
        {order.shipment && (
          <div className="confirmation-section">
            <h2><FaTruck /> Shipping Information</h2>
            <div className="shipping-info">
              <p><strong>Tracking Number:</strong> {order.shipment.awb || 'Pending'}</p>
              {order.shipment.trackingUrl && (
                <p><strong>Track Your Order:</strong> <a href={order.shipment.trackingUrl} target="_blank" rel="noopener noreferrer">Click here</a></p>
              )}
              <p><strong>Courier:</strong> {order.shipment.courier || 'To be assigned'}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="confirmation-actions">
          <Link to="/profile" className="action-btn primary">
            <FaShoppingBag /> View Order History
          </Link>
          <Link to="/t-shirts" className="action-btn secondary">
            Continue Shopping
          </Link>
        </div>

        {/* Email Confirmation Notice */}
        <div className="email-notice">
          <p>A confirmation email has been sent to your email address with order details.</p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
