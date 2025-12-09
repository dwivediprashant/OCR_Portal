// ==================== emailExtract.js ====================

function extractEmailFromText(text) {
  if (!text || typeof text !== "string") return null;

  const lines = text.split(/\r?\n/).map((l) => l.trim());

  // Accepted labels (English + Hindi)
  const emailLabel = /\b(email|e-mail|mail|ईमेल|ई-मेल|मेल)\b[:\-]?\s*/i;

  // OCR-friendly email pattern (English only)
  const emailRegex = /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,})\b/;

  // --------------------------
  // 1. Label-based detection
  // --------------------------
  for (let line of lines) {
    if (emailLabel.test(line)) {
      const m = line.match(emailRegex);
      if (m) return m[1].trim();
    }
  }

  // --------------------------
  // 2. Standalone email search
  // --------------------------
  for (let line of lines) {
    const m = line.match(emailRegex);
    if (m) return m[1].trim();
  }

  return null;
}

module.exports = extractEmailFromText;
