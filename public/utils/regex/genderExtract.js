// ==================== genderExtract.js ====================

function extractGenderFromText(text) {
  if (!text || typeof text !== "string") return null;

  // Common patterns: Gender: Male, Sex: M, etc.
  const genderRegex = /\b(?:gender|sex)\b[:\-]?\s*(male|female|other|m|f|o)\b/i;

  const m = text.match(genderRegex);
  if (!m) return null;

  const val = m[1].toLowerCase();

  if (val === "male" || val === "m") return "Male";
  if (val === "female" || val === "f") return "Female";
  return "Other";
}

module.exports = extractGenderFromText;
