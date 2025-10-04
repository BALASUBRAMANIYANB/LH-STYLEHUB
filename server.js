// Minimal Express server to serve Shiprocket tracking API
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const shiprocketTrackingRoute = require('./shiprocketTrackingRoute');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Mount the Shiprocket tracking route
app.use('/api', shiprocketTrackingRoute);

app.get('/', (req, res) => {
  res.send('Order Tracking API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
