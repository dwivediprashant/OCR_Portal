// ==================== mobileExtract.js ====================

function extractMobileFromText(text) {
  if (!text || typeof text !== "string") return null;

  // Convert Hindi digits → English digits
  const hindiDigits = {
    "०": "0",
    "१": "1",
    "२": "2",
    "३": "3",
    "४": "4",
    "५": "5",
    "६": "6",
    "७": "7",
    "८": "8",
    "९": "9",
  };

  const normalized = text.replace(/[०-९]/g, (d) => hindiDigits[d] || d);

  const lines = normalized.split(/\r?\n/).map((l) => l.trim());

  // Hindi + English mobile labels
  const labelRegex =
    /\b(mobile|mobile\s*no|phone|contact|मोबाइल|मोबाइल\s*नंबर|फोन|संपर्क)\b[:\-]?\s*/i;

  // Indian mobile number pattern: 10 digits starting with 6–9
  const mobilePattern = /\b([6-9]\d{9})\b/;

  // ---------------------------------
  // 1. Look for mobile under a label
  // ---------------------------------
  for (let line of lines) {
    if (labelRegex.test(line)) {
      const m = line.match(mobilePattern);
      if (m) return m[1];
    }
  }

  // ---------------------------------
  // 2. Free-search across the text
  // ---------------------------------
  const m = normalized.match(mobilePattern);
  if (m) return m[1];

  return null;
}

module.exports = extractMobileFromText;
