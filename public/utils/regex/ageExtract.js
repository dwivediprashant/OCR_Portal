// ==================== ageExtract.js ====================

function extractAgeFromText(text) {
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

  // Normalize: Hindi digits + fix OCR common errors
  let normalized = text
    .replace(/[०-९]/g, (d) => hindiDigits[d] || d)
    .replace(/[lI|]/g, "1") // OCR misreads of "1"
    .replace(/O/g, "0"); // OCR misread of zero

  const lines = normalized.split(/\r?\n/).map((l) => l.trim());

  // English + Hindi labels for age
  const labelRegex = /\b(age|aged|age\s*years|आयु|उम्र)\b[:\-]?\s*/i;

  // Pattern to extract age (1–3 digits, optionally with "yrs", "years")
  const agePattern = /\b(\d{1,3})\s*(years?|yrs?)?\b/i;

  // Age range validator (avoid false matches)
  const isValidAge = (num) => {
    const n = parseInt(num, 10);
    return n >= 1 && n <= 120; // realistic human age range
  };

  // ---------------------------------
  // 1. Look for age under a label
  // ---------------------------------
  for (let line of lines) {
    if (labelRegex.test(line)) {
      const match = line.match(agePattern);
      if (match && isValidAge(match[1])) {
        return match[1];
      }
    }
  }

  // ---------------------------------
  // 2. Free-search across full text (fallback)
  // ---------------------------------
  const matches = normalized.match(agePattern);
  if (matches && isValidAge(matches[1])) {
    return matches[1];
  }

  return null;
}

module.exports = extractAgeFromText;
