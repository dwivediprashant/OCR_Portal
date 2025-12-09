// ==================== fatherExtract.js ====================
// Returns father name in same language detected (Hindi OR English).
// Never mixes. Never converts.

function extractFatherNameFromText(text) {
  if (!text || typeof text !== "string") return null;

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let candidates = [];

  // --------------------------------------------------------
  // 1. Direct Father Name Labels (English + Hindi)
  // --------------------------------------------------------
  const labelRegex =
    /\b(?:father['’]?\s*name|father|पिता\s*का\s*नाम|पिता\s*का|पिता)\b[:\-]?\s*([A-Za-z\u0900-\u097F][A-Za-z\u0900-\u097F .'-]{2,60})/i;

  for (const line of lines) {
    const m = line.match(labelRegex);
    if (m) candidates.push(m[1].trim());
  }

  // --------------------------------------------------------
  // 2. S/O, Son Of (English)
  // --------------------------------------------------------
  const soRegex =
    /\b(?:s\/o|s\.o\.|s-\s*o|son\s*of)\b[:\-]?\s*([A-Za-z][A-Za-z .'-]{2,60})/i;

  for (const line of lines) {
    const m = line.match(soRegex);
    if (m) candidates.push(m[1].trim());
  }

  // --------------------------------------------------------
  // 3. Hindi relational patterns for father (very common)
  // --------------------------------------------------------
  const soHindiRegex =
    /\b(?:पिता\s*का\s*नाम|पिता\s*का|पिता|पुत्र\s*of|पुत्र\s*है)\b[:\-]?\s*([\u0900-\u097F][\u0900-\u097F .'-]{2,60})/i;

  for (const line of lines) {
    const m = line.match(soHindiRegex);
    if (m) candidates.push(m[1].trim());
  }

  // --------------------------------------------------------
  // 4. Fallback "Father :" line
  // --------------------------------------------------------
  const lineFallback = /^father[:\-]?\s*([A-Za-z][A-Za-z .'-]{2,60})$/im;

  const lf = text.match(lineFallback);
  if (lf) candidates.push(lf[1].trim());

  // --------------------------------------------------------
  // If nothing found
  // --------------------------------------------------------
  if (!candidates.length) return null;

  let father = candidates[0];

  // --------------------------------------------------------
  // 5. Clean safe prefixes (English + Hindi)
  // --------------------------------------------------------
  // English safe prefixes (do NOT remove name parts)
  father = father.replace(/\b(MR|SHRI|SMT)\b\.?/gi, "");

  // Hindi safe prefixes (do not remove meaningful name words)
  father = father
    .replace(/\b(श्री|श्रीमती)\b/g, "")
    .replace(/\b(पिता|पिता\s*का\s*नाम)\b/g, "")
    .trim();

  // --------------------------------------------------------
  // 6. Title-case only for pure English names
  // --------------------------------------------------------
  if (/^[A-Za-z .'-]+$/.test(father)) {
    father = father
      .split(/\s+/)
      .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }

  // Hindi returned EXACTLY as is
  return father || null;
}

module.exports = extractFatherNameFromText;
