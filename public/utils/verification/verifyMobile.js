// public/utils/verifyMobile.js
// Mobile verification using digit normalization and last-10-digit comparison.

function normalizeDigits(str) {
  if (!str) return "";
  // Hindi digits → English
  const hindi = {
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
  str = str.replace(/[०-९]/g, (d) => hindi[d] || d);

  // Remove everything except digits
  return str.replace(/\D/g, "");
}

function verifyMobile(filled, ocr) {
  const result = {
    filled: filled || "",
    ocr: ocr || "",
    matchScore: 0,
    status: "mismatch",
  };

  const f = normalizeDigits(filled);
  const o = normalizeDigits(ocr);

  if (!f && !o) {
    result.status = "missing";
    result.matchScore = 1;
    return result;
  }

  if (!f || !o) {
    result.status = "missing";
    return result;
  }

  // Use last 10 digits
  const f10 = f.slice(-10);
  const o10 = o.slice(-10);

  if (f10 === o10) {
    result.matchScore = 1;
    result.status = "match";
    return result;
  }

  // Partial match: first 7 digits match
  if (f10.slice(0, 7) === o10.slice(0, 7)) {
    result.matchScore = 0.7;
    result.status = "partial";
    return result;
  }

  // Mismatch
  result.matchScore = 0;
  result.status = "mismatch";
  return result;
}

module.exports = verifyMobile;
