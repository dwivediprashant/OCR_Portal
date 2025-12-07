// mobileExtract.js

function extractMobileFromText(text) {
  if (!text) return null;

  // Remove common separators (+91-, +91/, 98765-43210, etc.)
  const cleaned = text.replace(/[^\d]/g, " "); // turn symbols into spaces

  // Now extract ONLY Indian mobile numbers (10 digits, starting 6–9)
  const pattern = /\b([6-9]\d{9})\b/;

  const match = cleaned.match(pattern);
  if (!match) return null;

  return match[1]; // return only pure 10-digit number
}

module.exports = extractMobileFromText;
