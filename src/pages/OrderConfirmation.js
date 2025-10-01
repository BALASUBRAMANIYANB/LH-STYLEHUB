import React, { useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { formatCurrency } from '../utils/orderUtils';
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

  const total = order.total || (order.items ? order.items.reduce((s, i) => s + i.price * i.quantity, 0) : 0);

  return (
    <div className="order-tracking-container">
      <h2>Order Confirmed</h2>
      <div className="tracking-result" style={{ padding: '16px' }}>
        <h3>Thank you for your purchase!</h3>
        <p>Your order has been placed successfully.</p>
        <div style={{ marginTop: 12 }}>
          <strong>Order ID:</strong> {order.orderId || order.id || 'N/A'}
        </div>
        <div style={{ marginTop: 6 }}>
          <strong>Total:</strong> {formatCurrency(total)}
        </div>
        <div style={{ marginTop: 16 }}>
          <h4>Items</h4>
          <ul>
            {order.items && order.items.map((item, idx) => (
              <li key={idx}>
                {item.name} (Size: {item.selectedSize}) x {item.quantity} — {formatCurrency(item.price * item.quantity)}
              </li>
            ))}
          </ul>
        </div>
        <div style={{ marginTop: 16 }}>
          <Link to="/profile" className="btn">View in Profile</Link>
          <span style={{ margin: '0 8px' }}></span>
          <Link to="/products" className="btn">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
