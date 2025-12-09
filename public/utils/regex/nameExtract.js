// ==================== nameExtract.js ====================
// Reliable Name Extractor (English + Hindi) — NO language mixing.

function extractNameFromText(text) {
  if (!text || typeof text !== "string") return null;

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let candidates = [];

  // -------------------------------------------------------
  // 1. Label-based name extraction (English + Hindi)
  // -------------------------------------------------------
  const labelRegex =
    /\b(?:name|full\s*name|applicant\s*name|holder\s*name|card\s*holder|cardholder|नाम|पूरा\s*नाम|धारक\s*का\s*नाम|आवेदक\s*का\s*नाम)\b[:\-\s]*([A-Za-z\u0900-\u097F][A-Za-z\u0900-\u097F .'-]{2,60})/i;

  for (const line of lines) {
    const m = line.match(labelRegex);
    if (m) candidates.push(m[1].trim());
  }

  // -------------------------------------------------------
  // 2. S/O, D/O, C/O (English)
  // -------------------------------------------------------
  const soRegex = /\b(?:s\/o|d\/o|c\/o)\b[:\-\s]*([A-Za-z][A-Za-z .'-]{2,60})/i;

  // Hindi father/mother line formats
  const soHindiRegex =
    /\b(?:पिता\s*का\s*नाम|माता\s*का\s*नाम|पुत्र|पुत्री)\b[:\-\s]*([\u0900-\u097F][\u0900-\u097F .'-]{2,60})/i;

  for (const line of lines) {
    let m = line.match(soRegex);
    if (m) candidates.push(m[1].trim());

    m = line.match(soHindiRegex);
    if (m) candidates.push(m[1].trim());
  }

  // -------------------------------------------------------
  // 3. Uppercase 2–4 word lines (Typical PAN)
  // -------------------------------------------------------
  for (const line of lines) {
    if (/^[A-Z .' -]+$/.test(line) && !/\d/.test(line)) {
      const wc = line.split(/\s+/).length;
      if (wc >= 2 && wc <= 4) candidates.push(line.trim());
    }
  }

  // -------------------------------------------------------
  // 4. Pure Hindi name lines (Aadhaar, Voter ID)
  // -------------------------------------------------------
  for (const line of lines) {
    if (/^[\u0900-\u097F .'-]+$/.test(line) && !/\d/.test(line)) {
      const wc = line.split(/\s+/).length;
      if (wc >= 2 && wc <= 5) candidates.push(line.trim());
    }
  }

  if (!candidates.length) return null;

  let name = candidates[0];

  // -------------------------------------------------------
  // 5. Remove prefixes — Hindi & English, but only safe ones
  // -------------------------------------------------------

  // English honorifics
  name = name.replace(/\b(MR|MRS|MS|MISS|SHRI|SMT)\b\.?/gi, "");

  // Relationship noise (English)
  name = name.replace(/\b(S\/O|D\/O|C\/O)\b\.?/gi, "");

  // Hindi honorifics and noise (IMPORTANT: removed risky words like "कुमार")
  name = name
    .replace(/\b(श्री|श्रीमती|कुमारी)\b/g, "") // safe honorifics
    .replace(/\b(पुत्र|पुत्री|पिता|माता)\b/g, "") // relation labels
    .trim();

  // -------------------------------------------------------
  // 6. Title-case formatting ONLY for pure-English names
  // -------------------------------------------------------
  if (/^[A-Za-z .'-]+$/.test(name)) {
    name = name
      .split(/\s+/)
      .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }

  // -------------------------------------------------------
  // Hindi → returned EXACT Hindi without modification
  // English → returned in title case
  // -------------------------------------------------------
  return name || null;
}

module.exports = extractNameFromText;
