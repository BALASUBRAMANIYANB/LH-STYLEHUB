// Express route for Shiprocket order tracking and Razorpay payments
const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');

// Set these with your Shiprocket credentials
const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL;
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;
const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

// Razorpay credentials
const RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_live_ROYxFzNDDRuwWs';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '2k21aRdOrsHL7fbvqCD0YBWW';

let shiprocketToken = null;

async function authenticateShiprocket() {
  if (shiprocketToken) return shiprocketToken;
  const response = await axios.post(`${SHIPROCKET_BASE_URL}/auth/login`, {
    email: SHIPROCKET_EMAIL,
    password: SHIPROCKET_PASSWORD
  });
  shiprocketToken = response.data.token;
  return shiprocketToken;
}

// Razorpay order creation
router.post('/create-razorpay-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    // Create Razorpay order
    const razorpayOrder = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 0 // Don't auto-capture, we'll capture manually
    };

    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

    const response = await axios.post('https://api.razorpay.com/v1/orders', razorpayOrder, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Razorpay order created:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Razorpay order creation failed:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to create Razorpay order',
      details: error.response?.data || error.message
    });
  }
});

// Razorpay payment capture
router.post('/capture-razorpay-payment', async (req, res) => {
  try {
    const { paymentId, amount } = req.body;

    if (!paymentId || !amount) {
      return res.status(400).json({ error: 'Payment ID and amount are required' });
    }

    const captureAmount = Math.round(amount * 100); // Convert to paise
    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

    const response = await axios.post(`https://api.razorpay.com/v1/payments/${paymentId}/capture`, {
      amount: captureAmount,
      currency: 'INR'
    }, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Payment captured successfully:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Payment capture failed:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to capture payment',
      details: error.response?.data || error.message
    });
  }
});

router.post('/track', async (req, res) => {
  const { awb } = req.body;
  if (!awb) return res.status(400).json({ error: 'AWB number required' });
  try {
    const token = await authenticateShiprocket();
    const response = await axios.get(
      `${SHIPROCKET_BASE_URL}/courier/track/awb/${awb}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Tracking failed', details: err.message });
  }
});

router.post('/create-shipment', async (req, res) => {
  const { order } = req.body;
  console.log('Create shipment request received:', { orderId: order?.orderId });

  if (!order) {
    console.log('No order data provided');
    return res.status(400).json({ error: 'Order data required' });
  }

  try {
    console.log('Environment variables check:', {
      email: process.env.SHIPROCKET_EMAIL ? 'SET' : 'NOT SET',
      password: process.env.SHIPROCKET_PASSWORD ? 'SET' : 'NOT SET',
      pickup: process.env.SHIPROCKET_PICKUP_LOCATION,
      channel: process.env.SHIPROCKET_CHANNEL_ID
    });

    const { createShipment } = require('./src/utils/shiprocketTracking');
    console.log('Calling createShipment function...');
    const shipmentData = await createShipment(order);
    console.log('Shipment created successfully:', shipmentData);
    res.json(shipmentData);
  } catch (err) {
    console.error('Shipment creation error:', err);
    console.error('Error details:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status
    });
    res.status(500).json({
      error: 'Shipment creation failed',
      details: err.message,
      shiprocketError: err.response?.data
    });
  }
});

router.post('/send-order-confirmation', async (req, res) => {
  const { order } = req.body;
  if (!order) return res.status(400).json({ error: 'Order data required' });
  try {
    const { sendOrderConfirmation } = require('./src/utils/emailService');
    await sendOrderConfirmation(order);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Email send failed', details: err.message });
  }
});

router.post('/send-seller-notification', async (req, res) => {
  const { order, customerEmail } = req.body;
  if (!order) return res.status(400).json({ error: 'Order data required' });
  try {
    const { sendSellerNotification } = require('./src/utils/emailService');
    await sendSellerNotification(order, customerEmail);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Email send failed', details: err.message });
  }
});

module.exports = router;
