require('dotenv').config();
const { createShipment, getChannels, getPickupLocations } = require('./src/utils/shiprocketTracking');

async function testChannels() {
  try {
    console.log('Getting available channels...');
    const channels = await getChannels();
    console.log('Available channels:', JSON.stringify(channels, null, 2));
  } catch (error) {
    console.error('Error getting channels:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

async function testShipment() {
  const testOrder = {
    orderId: "TEST-123",
    items: [{
      name: "Test Product",
      quantity: 1,
      price: 100,
      id: "TEST001"
    }],
    total: 100,
    shippingAddress: {
      firstName: "Test",
      lastName: "User",
      address: "Test Address",
      city: "Test City",
      state: "Test State",
      zipCode: "123456",
      country: "India",
      email: "test@example.com",
      phone: "1234567890"
    }
  };

  try {
    console.log('Testing shipment creation...');
    const result = await createShipment(testOrder);
    console.log('Success:', result);
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// First get channels and pickup locations, then test shipment
async function runTests() {
  try {
    console.log('=== Getting available channels ===');
    const channels = await getChannels();
    console.log('Available channels:', JSON.stringify(channels, null, 2));

    console.log('\n=== Getting available pickup locations ===');
    const pickupLocations = await getPickupLocations();
    console.log('Available pickup locations:', JSON.stringify(pickupLocations, null, 2));

    // Update environment with correct pickup location if available
    if (pickupLocations && pickupLocations.data && pickupLocations.data.length > 0) {
      const firstLocation = pickupLocations.data[0];
      console.log(`\nUsing pickup location: ${firstLocation.pickup_location}`);
      process.env.SHIPROCKET_PICKUP_LOCATION = firstLocation.pickup_location;
    }

    console.log('\n--- Now testing shipment creation ---\n');
    await testShipment();
  } catch (error) {
    console.error('Test setup failed:', error);
  }
}

runTests();