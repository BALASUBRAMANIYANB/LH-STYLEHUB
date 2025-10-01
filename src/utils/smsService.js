// Dummy SMS service for notifications
async function sendSMS(to, message) {
  // Integrate with a real SMS service like Twilio, MSG91, etc.
  console.log(`SMS sent to ${to}: ${message}`);
}

module.exports = { sendSMS };
