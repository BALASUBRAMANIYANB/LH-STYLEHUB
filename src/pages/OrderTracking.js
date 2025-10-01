import React, { useState } from 'react';
import { FaSearch, FaTruck, FaCheckCircle, FaBox, FaHome, FaClock } from 'react-icons/fa';
import axios from 'axios';
import './OrderTracking.css';

const OrderTracking = () => {
  const [awb, setAwb] = useState('');
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTracking(null);
    try {
      const res = await axios.post('/api/track', { awb });
      setTracking(res.data);
    } catch (err) {
      setError('Tracking failed. Please check your AWB number.');
    }
    setLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing':
        return <FaClock className="status-icon processing" />;
      case 'shipped':
        return <FaTruck className="status-icon shipped" />;
      case 'delivered':
        return <FaCheckCircle className="status-icon delivered" />;
      default:
        return <FaBox className="status-icon" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processing':
        return 'var(--medium-gray)';
      case 'shipped':
        return 'var(--primary-black)';
      case 'delivered':
        return '#28a745';
      default:
        return 'var(--medium-gray)';
    }
  };

  const formatPrice = (price) => {
    try {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);
    } catch {
      return `₹${Number(price).toFixed(2)}`;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="order-tracking-container">
      <h2>Track Your Order</h2>
      <form onSubmit={handleTrack} className="order-tracking-form">
        <input
          type="text"
          placeholder="Enter AWB Number"
          value={awb}
          onChange={e => setAwb(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>{loading ? 'Tracking...' : 'Track Order'}</button>
      </form>
      {error && <div className="error-message">{error}</div>}
      {tracking && (
        <div className="tracking-result">
          <h3>Status: {tracking.status || tracking.current_status}</h3>
          <ul>
            {tracking.data && tracking.data.length > 0 ? tracking.data.map((event, idx) => (
              <li key={idx}>
                <strong>{event.status}</strong> - {event.activity_date} <br />
                {event.location && <span>Location: {event.location}</span>}
              </li>
            )) : <li>No tracking events found.</li>}
          </ul>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
