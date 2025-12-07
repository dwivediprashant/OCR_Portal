// idNumberExtract.js

function extractIDNumber(text) {
  if (!text) return null;
  const t = text.toUpperCase();

  // --- Strong patterns for specific IDs ---

  // PAN (ABCDE1234F)
  const pan = /\b([A-Z]{5}[0-9]{4}[A-Z])\b/;
  const panMatch = t.match(pan);
  if (panMatch) return panMatch[1];

  // Aadhaar (12 digits, starting 2-9)
  // (normalize before passing -> no spaces/dashes)
  const aadhaar = /\b([2-9][0-9]{11})\b/;
  const aadhaarMatch = t.match(aadhaar);
  if (aadhaarMatch) return aadhaarMatch[1];

  // Driving Licence (DJ-14-2021-1234567 or compact 16 chars)
  const dl =
    /\b([A-Z]{2}[0-9]{2}[0-9A-Z]{4}[0-9]{7}|[A-Z]{2}[- ]?[0-9]{2}[- ]?[0-9]{4}[- ]?[0-9]{7})\b/;
  const dlMatch = t.match(dl);
  if (dlMatch) return dlMatch[1].replace(/[- ]/g, "");

  // Voter ID (EPIC) – 3 letters + 7 digits
  const voter = /\b([A-Z]{3}[0-9]{7})\b/;
  const voterMatch = t.match(voter);
  if (voterMatch) return voterMatch[1];

  // Passport – 1 letter + 7 digits
  const passport = /\b([A-PR-WYa-pr-wy][0-9]{7})\b/;
  const passportMatch = t.match(passport);
  if (passportMatch) return passportMatch[1];

  // GSTIN (15 chars)
  const gst = /\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z])\b/;
  const gstMatch = t.match(gst);
  if (gstMatch) return gstMatch[1];

  // Generic fallback ONLY if clearly labeled
  const generic =
    /\b(?:id|id\s*no|id\s*number|card\s*no|unique\s*id|uid)[:\-\s]*([A-Z0-9]{6,20})\b/;
  const genericMatch = t.match(generic);
  if (genericMatch) return genericMatch[1];

  return null;
}

module.exports = extractIDNumber;
