// ==================== fatherExtract.js (ULTRA-ROBUST VERSION) ====================

function extractFatherNameFromText(text, lang = "eng") {
  if (!text || typeof text !== "string") return null;

  const cleaned = text
    .replace(/[|•·]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  const lines = cleaned
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let candidates = [];

  // ================================
  //       ENGLISH MODE
  // ================================
  if (lang === "eng") {
    const englishPatterns = [
      // Normal father name pattern
      /\bfather['’]?\s*name\s*[:\-]?\s*([A-Za-z][A-Za-z .'’-]{2,60})/i,

      // "Father:" or "Father - "
      /\bfather['’]?\s*[:\-]?\s*([A-Za-z][A-Za-z .'’-]{2,60})/i,

      // Noisy PAN-like OCR
      /fath[ea]r['’]?\s*name\s*[:\-]?\s*([A-Za-z][A-Za-z .'’-]{2,60})/i,

      // Noisy variations (fatner, fother, fater etc.)
      /fat[hnmr]er['’]?\s*name\s*[:\-]?\s*([A-Za-z][A-Za-z .'’-]{2,60})/i,
    ];

    for (const line of lines) {
      if (!/father/i.test(line)) continue;

      for (const p of englishPatterns) {
        const m = line.match(p);
        if (m && m[1]) {
          if (/^s\s*name$/i.test(m[1])) continue;
          candidates.push(m[1].trim());
        }
      }
    }

    // ===============================
    //  S/O, D/O, C/O  (VERY COMMON)
    // ===============================
    const soPatterns = [
      /\b(?:s\/o|s\.o\.|s-?o|son of)\b[:\-]?\s*([A-Za-z][A-Za-z .'’-]{2,60})/i,
      /\b(?:d\/o|d\.o\.|d-?o|daughter of)\b[:\-]?\s*([A-Za-z][A-Za-z .'’-]{2,60})/i,
      /\b(?:c\/o|c\.o\.|c-?o|care of)\b[:\-]?\s*([A-Za-z][A-Za-z .'’-]{2,60})/i,
      /\b(?:5\/o|5-o)\b[:\-]?\s*([A-Za-z][A-Za-z .'’-]{2,60})/i, // OCR: 5/o instead of S/o
    ];

    for (const p of soPatterns) {
      const m = cleaned.match(p);
      if (m && m[1]) candidates.push(m[1].trim());
    }
  }

  // ================================
  //       HINDI MODE
  // ================================
  if (lang === "hin") {
    const hindiPatterns = [
      /\bपिता\s*का\s*नाम\s*[:\-]?\s*([\u0900-\u097F .'’-]{2,60})/,
      /\bपिता\s*[:\-]?\s*([\u0900-\u097F .'’-]{2,60})/,
      /\bपिता\s*नाम\s*[:\-]?\s*([\u0900-\u097F .'’-]{2,60})/,
      /\bपि\s*का\s*नाम\s*[:\-]?\s*([\u0900-\u097F .'’-]{2,60})/, // OCR break
    ];

    for (const line of lines) {
      if (!/पिता|पुत्र|पुत्री/i.test(line)) continue;

      for (const p of hindiPatterns) {
        const m = line.match(p);
        if (m && m[1]) candidates.push(m[1].trim());
      }
    }

    // S/O, D/O Hindi equivalents
    const hindiSO = [
      /\bपुत्र\s*[:\-]?\s*([\u0900-\u097F .'’-]{2,60})/,
      /\bपुत्री\s*[:\-]?\s*([\u0900-\u097F .'’-]{2,60})/,
    ];

    for (const p of hindiSO) {
      const m = cleaned.match(p);
      if (m && m[1]) candidates.push(m[1].trim());
    }
  }

  // ================================
  //   FINAL FILTER & SELECTION
  // ================================
  if (!candidates.length) return null;

  // Remove garbage: single words like "Name", "Father", etc.
  candidates = candidates.filter((c) => c.length > 3 && !/name/i.test(c));

  if (!candidates.length) return null;

  // Choose longest → usually real parent name
  let father = candidates.sort((a, b) => b.length - a.length)[0];

  // Cleanup titles (English)
  if (lang === "eng") {
    father = father.replace(/\b(MR|SHRI|SMT|MR\.)\b/gi, "").trim();

    if (/^[A-Za-z .'-]+$/.test(father)) {
      father = father
        .split(/\s+/)
        .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
    }
  }

  return father || null;
}

module.exports = extractFatherNameFromText;
