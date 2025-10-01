// Basic input validation and security helpers
function sanitizeInput(input) {
  return String(input).replace(/[<>]/g, '');
}

function isValidEmail(email) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

module.exports = { sanitizeInput, isValidEmail };
