require('dotenv').config();
const axios = require('axios');

const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL;
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;
const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

async function checkPickupLocations() {
  try {
    console.log('Checking Shiprocket pickup locations...');

    // Authenticate
    const authResponse = await axios.post(`${SHIPROCKET_BASE_URL}/auth/login`, {
      email: SHIPROCKET_EMAIL,
      password: SHIPROCKET_PASSWORD
    });

    const token = authResponse.data.token;

    // Get pickup locations
    const pickupResponse = await axios.get(`${SHIPROCKET_BASE_URL}/settings/company/pickup`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Pickup locations response:');
    console.log(JSON.stringify(pickupResponse.data, null, 2));

    const shippingAddresses = pickupResponse.data.data?.shipping_address || [];

    if (shippingAddresses.length > 0) {
      console.log('\n✅ Pickup locations found!');
      shippingAddresses.forEach((location, index) => {
        console.log(`${index + 1}. ${location.pickup_location} (ID: ${location.id})`);
        console.log(`   Address: ${location.address}, ${location.city}, ${location.state} ${location.pin_code}`);
        console.log(`   Status: ${location.status === 2 ? 'Active' : 'Inactive'}`);
      });

      // Check if the configured pickup location matches
      const configuredLocation = process.env.SHIPROCKET_PICKUP_LOCATION;
      const matchingLocation = shippingAddresses.find(loc => loc.pickup_location.trim() === configuredLocation);

      if (matchingLocation) {
        console.log(`\n✅ Configured pickup location "${configuredLocation}" found and matches!`);
      } else {
        console.log(`\n⚠️  Configured pickup location "${configuredLocation}" not found exactly.`);
        console.log('Available locations:', shippingAddresses.map(loc => `"${loc.pickup_location}"`).join(', '));
      }
    } else {
      console.log('\n❌ No pickup locations configured!');
      console.log('You need to add a pickup location in Shiprocket dashboard first.');
    }

  } catch (error) {
    console.error('Error checking pickup locations:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
  }
}

checkPickupLocations();