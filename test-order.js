require('dotenv').config();
const axios = require('axios');

const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL;
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;
const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

// Sample order data
const sampleOrder = {
  orderId: 'TEST-' + Date.now(),
  shippingAddress: {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    phone: '9876543210',
    address: '123 Test Street',
    city: 'Test City',
    state: 'Test State',
    zipCode: '123456',
    country: 'India'
  },
  items: [
    {
      name: 'Test Product',
      id: 'TEST001',
      quantity: 1,
      price: 100
    }
  ],
  total: 100
};

async function testOrderCreation() {
  try {
    console.log('Testing order creation in Shiprocket...');

    // Authenticate
    const authResponse = await axios.post(`${SHIPROCKET_BASE_URL}/auth/login`, {
      email: SHIPROCKET_EMAIL,
      password: SHIPROCKET_PASSWORD
    });

    const token = authResponse.data.token;
    console.log('✅ Authentication successful');

    // Prepare order data
    const shipmentData = {
      order_id: sampleOrder.orderId,
      order_date: new Date().toISOString().split('T')[0],
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION,
      channel_id: process.env.SHIPROCKET_CHANNEL_ID,
      comment: 'Test order from LH StyleHub',

      billing_customer_name: `${sampleOrder.shippingAddress.firstName} ${sampleOrder.shippingAddress.lastName}`,
      billing_last_name: sampleOrder.shippingAddress.lastName,
      billing_address: sampleOrder.shippingAddress.address,
      billing_city: sampleOrder.shippingAddress.city,
      billing_pincode: parseInt(sampleOrder.shippingAddress.zipCode),
      billing_state: sampleOrder.shippingAddress.state,
      billing_country: sampleOrder.shippingAddress.country,
      billing_email: sampleOrder.shippingAddress.email,
      billing_phone: sampleOrder.shippingAddress.phone,

      shipping_is_billing: true,
      shipping_customer_name: `${sampleOrder.shippingAddress.firstName} ${sampleOrder.shippingAddress.lastName}`,
      shipping_address: sampleOrder.shippingAddress.address,
      shipping_city: sampleOrder.shippingAddress.city,
      shipping_pincode: parseInt(sampleOrder.shippingAddress.zipCode),
      shipping_country: sampleOrder.shippingAddress.country,
      shipping_state: sampleOrder.shippingAddress.state,
      shipping_email: sampleOrder.shippingAddress.email,
      shipping_phone: sampleOrder.shippingAddress.phone,

      order_items: sampleOrder.items.map((item, index) => ({
        name: item.name,
        sku: item.id || `SKU${index + 1}`,
        units: parseInt(item.quantity),
        selling_price: parseFloat(item.price),
        discount: 0,
        tax: 0,
        hsn: 61091000
      })),

      payment_method: 'COD',
      sub_total: parseFloat(sampleOrder.total),
      length: 20,
      breadth: 15,
      height: 5,
      weight: 0.5
    };

    console.log('Sending order data to Shiprocket...');

    // Create order
    const orderResponse = await axios.post(
      `${SHIPROCKET_BASE_URL}/orders/create/adhoc`,
      shipmentData,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log('✅ Order created successfully!');
    console.log('Order ID:', orderResponse.data.order_id);
    console.log('Shipment ID:', orderResponse.data.shipment_id);
    console.log('AWB:', orderResponse.data.awb_code);
    console.log('Status:', orderResponse.data.status);

  } catch (error) {
    console.error('❌ Order creation failed:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Error Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Error Message:', error.message);
  }
}

testOrderCreation();