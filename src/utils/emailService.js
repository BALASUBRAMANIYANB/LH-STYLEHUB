// Dummy email service for notifications
async function sendEmail(to, subject, message) {
  // Integrate with a real email service like SendGrid, Mailgun, etc.
  console.log(`Email sent to ${to}: ${subject} - ${message}`);
}

module.exports = { sendEmail };
