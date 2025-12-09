// public/utils/verifyID.js
// Strict verification for Aadhaar, PAN, Passport, VoterID, DL, GSTIN.

const verhoeff = require("../verhoef");

// normalize: uppercase + remove spaces/dashes
function norm(str) {
  if (!str) return "";
  return str.toUpperCase().replace(/[\s\-]/g, "");
}

function verifyAadhaar(f, o) {
  f = norm(f);
  o = norm(o);
  if (f === o && f.length === 12 && verhoeff.validate(f)) {
    return { matchScore: 1, status: "match" };
  }
  return { matchScore: 0, status: "mismatch" };
}

function verifyPAN(f, o) {
  f = norm(f);
  o = norm(o);
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
  if (panRegex.test(f) && f === o) return { matchScore: 1, status: "match" };
  return { matchScore: 0, status: "mismatch" };
}

function verifyPassport(f, o) {
  f = norm(f);
  o = norm(o);
  const passRegex = /^[A-PR-WY][0-9]{7}$/;
  if (passRegex.test(f) && f === o) return { matchScore: 1, status: "match" };
  return { matchScore: 0, status: "mismatch" };
}

function verifyVoter(f, o) {
  f = norm(f);
  o = norm(o);
  const regex = /^[A-Z]{3}[0-9]{7}$/;
  if (regex.test(f) && f === o) return { matchScore: 1, status: "match" };
  return { matchScore: 0, status: "mismatch" };
}

function verifyDL(f, o) {
  f = norm(f);
  o = norm(o);
  const regex = /^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{6,8}$/;
  if (regex.test(f) && f === o) return { matchScore: 1, status: "match" };
  return { matchScore: 0, status: "mismatch" };
}

function verifyGST(f, o) {
  f = norm(f);
  o = norm(o);
  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
  if (regex.test(f) && f === o) return { matchScore: 1, status: "match" };
  return { matchScore: 0, status: "mismatch" };
}

function verifyIDNumber(filled, ocr) {
  const f = norm(filled);
  const o = norm(ocr);

  // detect ID type using OCR value (which came from extractor)
  if (/^[2-9]\d{11}$/.test(o)) return verifyAadhaar(f, o);
  if (/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(o)) return verifyPAN(f, o);
  if (/^[A-PR-WY][0-9]{7}$/.test(o)) return verifyPassport(f, o);
  if (/^[A-Z]{3}[0-9]{7}$/.test(o)) return verifyVoter(f, o);
  if (/^[A-Z]{2}[0-9]{2}/.test(o)) return verifyDL(f, o);
  if (/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(o))
    return verifyGST(f, o);

  // fallback (unknown ID) → exact match only
  return f === o
    ? { matchScore: 1, status: "match" }
    : { matchScore: 0, status: "mismatch" };
}

module.exports = verifyIDNumber;
