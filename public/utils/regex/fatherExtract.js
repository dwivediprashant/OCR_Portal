// ==================== fatherExtract.js ====================

function extractFatherNameFromText(text) {
  if (!text || typeof text !== "string") return null;

  // ---- 1. Label-based (highest accuracy) ----
  const directLabel =
    /\b(father['’]?\s*name|father)\b[:\-]?\s*([A-Za-z][A-Za-z .'-]{2,60})/i;

  const m = text.match(directLabel);
  if (m) return m[2].trim();

  // ---- 2. S/O, Son Of formats ----
  const soRegex =
    /\b(?:s\/o|s\.o\.|s-\s*o|son\s*of)\b[:\-]?\s*([A-Za-z][A-Za-z .'-]{2,60})/i;

  const s = text.match(soRegex);
  if (s) return s[1].trim();

  // ---- 3. Fallback: standalone "Father :" on its own line ----
  const lineFallback = /^father[:\-]?\s*([A-Za-z][A-Za-z .'-]{2,60})$/im;

  const lf = text.match(lineFallback);
  if (lf) return lf[1].trim();

  return null;
}

module.exports = extractFatherNameFromText;
