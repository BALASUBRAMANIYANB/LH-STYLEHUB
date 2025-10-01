// Shiprocket Order Tracking Utility
// This module provides a function to track shipments using the Shiprocket API.
// Usage: Call trackShipment(orderId, awb) and handle the returned promise.

const axios = require('axios');

// Replace with your Shiprocket API credentials (set these in your environment variables)
const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL;
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;
const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

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

/**
 * Track a shipment using Shiprocket API
 * @param {string} awb - The Air Waybill (AWB) number of the shipment
 * @returns {Promise<Object>} - Tracking details from Shiprocket
 */
async function trackShipment(awb) {
  const token = await authenticateShiprocket();
  const response = await axios.get(
    `${SHIPROCKET_BASE_URL}/courier/track/awb/${awb}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
}

module.exports = { trackShipment };
