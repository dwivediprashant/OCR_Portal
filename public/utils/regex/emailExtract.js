// ==================== emailExtract.js ====================

function extractEmailFromText(text) {
  if (!text || typeof text !== "string") return null;

  // Common email regex (OCR-friendly)
  const emailRegex = /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,})\b/;

  const match = text.match(emailRegex);
  return match ? match[1].trim() : null;
}

module.exports = extractEmailFromText;
