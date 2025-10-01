// Dummy analytics integration
function trackEvent(event, data) {
  // Integrate with Google Analytics, Facebook Pixel, etc.
  console.log(`Analytics event: ${event}`, data);
}

module.exports = { trackEvent };
