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

/**
 * Create a shipment using Shiprocket API
 * @param {Object} order - The order object
 * @returns {Promise<Object>} - Shipment creation response from Shiprocket
 */
async function createShipment(order) {
  const token = await authenticateShiprocket();

  // Prepare order data for Shiprocket
  const shipmentData = {
    order_id: order.orderId,
    order_date: new Date(order.orderDate).toISOString().split('T')[0], // YYYY-MM-DD
    pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary', // Set in env
    channel_id: process.env.SHIPROCKET_CHANNEL_ID || '', // Required: sales channel ID
    comment: 'Auto-created shipment',
    billing_customer_name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
    billing_last_name: order.shippingAddress.lastName,
    billing_address: order.shippingAddress.address,
    billing_address_2: '',
    billing_city: order.shippingAddress.city,
    billing_pincode: order.shippingAddress.zipCode,
    billing_state: order.shippingAddress.state,
    billing_country: order.shippingAddress.country,
    billing_email: order.shippingAddress.email,
    billing_phone: order.shippingAddress.phone,
    shipping_is_billing: true,
    shipping_customer_name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
    shipping_last_name: order.shippingAddress.lastName,
    shipping_address: order.shippingAddress.address,
    shipping_address_2: '',
    shipping_city: order.shippingAddress.city,
    shipping_pincode: order.shippingAddress.zipCode,
    shipping_country: order.shippingAddress.country,
    shipping_state: order.shippingAddress.state,
    shipping_email: order.shippingAddress.email,
    shipping_phone: order.shippingAddress.phone,
    order_items: order.items.map(item => ({
      name: item.name,
      sku: item.id,
      units: item.quantity,
      selling_price: item.price,
      discount: 0,
      tax: 0,
      hsn: 0
    })),
    payment_method: 'COD', // Since it's COD
    shipping_charges: 0,
    giftwrap_charges: 0,
    transaction_charges: 0,
    total_discount: 0,
    sub_total: order.total,
    length: 10, // Default dimensions
    breadth: 10,
    height: 10,
    weight: 0.5
  };

  const response = await axios.post(
    `${SHIPROCKET_BASE_URL}/orders/create`,
    shipmentData,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
}

module.exports = { trackShipment, createShipment };
