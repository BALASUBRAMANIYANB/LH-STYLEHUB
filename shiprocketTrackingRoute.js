// Express route for Shiprocket order tracking
const express = require('express');
const router = express.Router();
const axios = require('axios');

// Set these with your Shiprocket credentials
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

module.exports = router;
