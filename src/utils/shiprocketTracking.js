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

  // Prepare order data for Shiprocket - simplified format
  const shipmentData = {
    order_id: order.orderId,
    order_date: new Date().toISOString().split('T')[0], // Today's date
    pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Lh style hub store',
    comment: 'Auto-created shipment from LH StyleHub',

    // Billing Address
    billing_customer_name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
    billing_last_name: order.shippingAddress.lastName,
    billing_address: order.shippingAddress.address,
    billing_address_2: '', // Optional second address line
    billing_city: order.shippingAddress.city,
    billing_pincode: order.shippingAddress.zipCode.toString(), // Keep as string
    billing_state: order.shippingAddress.state,
    billing_country: order.shippingAddress.country,
    billing_email: order.shippingAddress.email,
    billing_phone: order.shippingAddress.phone,

    // Shipping Address (same as billing)
    shipping_is_billing: true,
    shipping_customer_name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
    shipping_address: order.shippingAddress.address,
    shipping_address_2: '', // Optional second address line
    shipping_city: order.shippingAddress.city,
    shipping_pincode: order.shippingAddress.zipCode.toString(), // Keep as string
    shipping_country: order.shippingAddress.country,
    shipping_state: order.shippingAddress.state,
    shipping_email: order.shippingAddress.email,
    shipping_phone: order.shippingAddress.phone,

    // Order Items
    order_items: order.items.map((item, index) => ({
      name: item.name,
      sku: item.id || `SKU${index + 1}`,
      units: parseInt(item.quantity),
      selling_price: parseFloat(item.price),
      discount: 0,
      tax: 0,
      hsn: 61091000 // Default HSN for clothing
    })),

    // Payment and charges
    payment_method: order.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
    sub_total: parseFloat(order.total),
    length: 30, // Package dimensions in cm (more realistic for clothing)
    breadth: 25,
    height: 5,
    weight: 0.8 // Weight in kg (more realistic for T-shirt packaging)
  };

  console.log('=== SHIPMENT CREATION DEBUG ===');
  console.log('Environment variables:', {
    email: process.env.SHIPROCKET_EMAIL,
    pickup: process.env.SHIPROCKET_PICKUP_LOCATION,
    channel: process.env.SHIPROCKET_CHANNEL_ID
  });
  console.log('Sending shipment data to Shiprocket:', JSON.stringify(shipmentData, null, 2));

  try {
    // Use the specific channel ID provided
    shipmentData.channel_id = 8454052;
    console.log('Using channel ID:', shipmentData.channel_id);

    // Get pickup locations to ensure we use the correct one
    console.log('Getting pickup locations...');
    const pickupResponse = await axios.get(
      `${SHIPROCKET_BASE_URL}/settings/company/pickup`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('Available pickup locations:', pickupResponse.data);

    // Use the first available pickup location if available
    if (pickupResponse.data && pickupResponse.data.data && pickupResponse.data.data.shipping_address && pickupResponse.data.data.shipping_address.length > 0) {
      const pickupLocation = pickupResponse.data.data.shipping_address[0];
      shipmentData.pickup_location = pickupLocation.pickup_location || pickupLocation.address || pickupLocation.id || 'Lh style hub store';
      console.log('Using pickup location:', shipmentData.pickup_location, 'from available locations:', pickupResponse.data.data.shipping_address);
    } else {
      console.log('No pickup locations found, using default');
      shipmentData.pickup_location = 'Lh style hub store';
    }

    // Try the adhoc order creation endpoint (doesn't require channel_id)
    const response = await axios.post(
      `${SHIPROCKET_BASE_URL}/orders/create/adhoc`,
      shipmentData,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Shiprocket API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: `${SHIPROCKET_BASE_URL}/orders/create`
    });
    throw error;
  }
}

/**
 * Get available channels from Shiprocket
 * @returns {Promise<Array>} - List of available channels
 */
async function getChannels() {
  const token = await authenticateShiprocket();
  const response = await axios.get(
    `${SHIPROCKET_BASE_URL}/channels`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
}

/**
 * Get available pickup locations from Shiprocket
 * @returns {Promise<Array>} - List of available pickup locations
 */
async function getPickupLocations() {
  const token = await authenticateShiprocket();
  const response = await axios.get(
    `${SHIPROCKET_BASE_URL}/settings/company/pickup`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  // Return the shipping_address array
  return response.data.data?.shipping_address || [];
}

module.exports = { trackShipment, createShipment, getChannels, getPickupLocations };
