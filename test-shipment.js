require('dotenv').config();
const axios = require('axios');

const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL;
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;
const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

async function testShiprocketConnection() {
  console.log('Testing Shiprocket API connection...');
  console.log('Email:', SHIPROCKET_EMAIL);
  console.log('Password:', SHIPROCKET_PASSWORD ? 'SET' : 'NOT SET');

  try {
    // Test authentication
    console.log('\n1. Testing authentication...');
    const authResponse = await axios.post(`${SHIPROCKET_BASE_URL}/auth/login`, {
      email: SHIPROCKET_EMAIL,
      password: SHIPROCKET_PASSWORD
    });

    console.log('✅ Authentication successful!');
    console.log('Token received:', authResponse.data.token ? 'YES' : 'NO');

    const token = authResponse.data.token;

    // Test getting channels
    console.log('\n2. Testing channels API...');
    const channelsResponse = await axios.get(`${SHIPROCKET_BASE_URL}/channels`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Channels API working!');
    console.log('Available channels:', channelsResponse.data.data?.length || 0);

    // Test pickup locations
    console.log('\n3. Testing pickup locations...');
    const pickupResponse = await axios.get(`${SHIPROCKET_BASE_URL}/settings/company/pickup`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Pickup locations API working!');
    console.log('Pickup locations:', pickupResponse.data.data?.length || 0);

    console.log('\n🎉 All Shiprocket API tests passed!');

  } catch (error) {
    console.error('\n❌ Shiprocket API test failed:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Error Data:', error.response?.data);
    console.error('Error Message:', error.message);
  }
}

testShiprocketConnection();