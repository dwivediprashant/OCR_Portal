// ==================== nameExtract.js ====================

// Short + Reliable Name Extractor
function extractNameFromText(text) {
  if (!text || typeof text !== "string") return null;

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let candidates = [];

  // ---- 1. Label-based name extraction ----
  const labelRegex =
    /\b(?:name|full\s*name|applicant\s*name|holder\s*name)\b[:\-\s]*([A-Za-z][A-Za-z .'-]{2,60})/i;

  for (const line of lines) {
    const m = line.match(labelRegex);
    if (m) candidates.push(m[1].trim());
  }

  // ---- 2. Lines with S/O or D/O (common in IDs) ----
  const soRegex = /\b(?:s\/o|d\/o|c\/o)\b[:\-\s]*([A-Za-z][A-Za-z .'-]{2,60})/i;

  for (const line of lines) {
    const m = line.match(soRegex);
    if (m) candidates.push(m[1].trim());
  }

  // ---- 3. Pure uppercase 2–4 word lines (PAN/Aadhaar style) ----
  for (const line of lines) {
    if (/^[A-Z .' -]+$/.test(line) && !/\d/.test(line)) {
      const wc = line.split(/\s+/).length;
      if (wc >= 2 && wc <= 4) candidates.push(line.trim());
    }
  }

  if (!candidates.length) return null;

  // ---- Clean prefixes (Mr, Mrs, S/O, etc.) ----
  let name = candidates[0]
    .replace(/\b(MR|MRS|MS|MISS|S\/O|D\/O|C\/O)\b\.?/gi, "")
    .trim();

  // ---- Title-case formatting ----
  name = name
    .split(/\s+/)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  return name || null;
}

module.exports = extractNameFromText;
