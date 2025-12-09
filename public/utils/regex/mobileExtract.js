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

  let normalized = text.replace(/[०-९]/g, (d) => hindiDigits[d] || d);

  const lines = normalized.split(/\r?\n/).map((l) => l.trim());

  // English + Hindi labels
  const labelRegex =
    /\b(mobile|mobile\s*no|phone|contact|फोन|मोबाइल|मोबाइल\s*नंबर|संपर्क)\b[:\-]?\s*/i;

  // Flexible phone number pattern:
  // Accepts +91, (), spaces, hyphens → final digits count 5 to 15
  const phonePattern = /(?:\+?\d[\d\-\s()]{3,20}\d)/g;

  // Normalize number by stripping everything except digits
  const cleanNumber = (x) => x.replace(/[^\d]/g, "");

  // Validate cleaned number length (avoid false matches)
  const isValidPhone = (num) => num.length >= 5 && num.length <= 15;

  // ---------------------------------
  // 1. Look for labelled phone lines
  // ---------------------------------
  for (let line of lines) {
    if (labelRegex.test(line)) {
      const matches = line.match(phonePattern);
      if (matches) {
        for (let m of matches) {
          const cleaned = cleanNumber(m);
          if (isValidPhone(cleaned)) return cleaned;
        }
      }
    }
  }

  // ---------------------------------
  // 2. Free search across full text
  // ---------------------------------
  const globalMatches = normalized.match(phonePattern);
  if (globalMatches) {
    for (let m of globalMatches) {
      const cleaned = cleanNumber(m);
      if (isValidPhone(cleaned)) return cleaned;
    }
  }

  return null;
}

module.exports = extractMobileFromText;
