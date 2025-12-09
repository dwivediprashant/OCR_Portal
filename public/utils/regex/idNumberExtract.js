// idNumberExtract.js
// Improved Aadhaar detection (grouped + compact) with Verhoeff validation
// Exports: extractIDNumber(text) -> string | null

function extractIDNumber(text) {
  if (!text || typeof text !== "string") return null;

  // normalize whitespace and convert to upper
  const raw = text.replace(/\u00A0/g, " "); // NBSP -> space
  const t = raw.toUpperCase();

  // ---------------- Verhoeff (Aadhaar) ----------------
  // tables for Verhoeff algorithm
  const d = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
  ];
  const p = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
  ];

  function verhoeffValidate(numStr) {
    if (!/^\d+$/.test(numStr)) return false;
    let c = 0;
    const arr = numStr
      .split("")
      .reverse()
      .map((ch) => parseInt(ch, 10));
    for (let i = 0; i < arr.length; i++) {
      c = d[c][p[i % 8][arr[i]]];
    }
    return c === 0;
  }

  // ---------------- Strong patterns for specific IDs ----------------

  // 1) PAN (ABCDE1234F) — strict
  const pan = t.match(/\b([A-Z]{5}[0-9]{4}[A-Z])\b/);
  if (pan) return pan[1];

  // 2) Aadhaar (allow grouped "1234 5678 9012" or compact "123456789012")
  //    - require starting digit 2-9 for the first digit (Aadhaar rule)
  //    - capture grouped or compact forms
  const aadhaarGroupRegex = /\b([2-9][0-9]{3}(?:[ \-]?[0-9]{4}){2})\b/;
  const aadhaarMatch = t.match(aadhaarGroupRegex);
  if (aadhaarMatch) {
    const candidate = aadhaarMatch[1].replace(/[\s\-]/g, "");
    if (candidate.length === 12 && verhoeffValidate(candidate)) {
      return candidate;
    }
    // if grouped match but checksum fails, *don't* immediately return;
    // fall through to other patterns / generic fallback
  }

  // Also try compact 12-digit runs (in case OCR removed spaces)
  const aadhaarCompact = t.match(/\b([2-9][0-9]{11})\b/);
  if (aadhaarCompact) {
    const candidate = aadhaarCompact[1];
    if (verhoeffValidate(candidate)) return candidate;
    // else continue — not a valid aadhaar
  }

  // 3) Driving Licence (heuristic)
  // Keep flexible: allow forms with dashes/spaces; normalize before returning
  const dl = t.match(
    /\b([A-Z]{2}[- ]?[0-9]{2}[- ]?[0-9]{4}[- ]?[0-9]{6,8}|[A-Z]{2}[0-9A-Z]{6,14})\b/
  );
  if (dl) return dl[1].replace(/[- ]/g, "");

  // 4) Voter ID (EPIC) – common pattern 3 letters + 7 digits
  const voter = t.match(/\b([A-Z]{3}[0-9]{7})\b/);
  if (voter) return voter[1];

  // 5) Passport – 1 letter (excluding some letters) + 7 digits
  // Use case-insensitive match but input already uppercased
  const passport = t.match(/\b([A-PR-WY][0-9]{7})\b/);
  if (passport) return passport[1];

  // 6) GSTIN (15 chars) - keep strict pattern
  const gst = t.match(/\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z])\b/);
  if (gst) return gst[1];

  // 7) Generic labeled fallback: only return when clearly labeled (e.g., "ID No: XYZ")
  const generic = t.match(
    /\b(?:ID|ID\s*NO|ID\s*NUMBER|CARD\s*NO|UNIQUE\s*ID|UID)[:\-\s]*([A-Z0-9][A-Z0-9 \-]{4,40}[A-Z0-9])\b/
  );
  if (generic) {
    // normalize spaces/dashes
    return generic[1].replace(/[\s\-]/g, "");
  }

  return null;
}

module.exports = extractIDNumber;
