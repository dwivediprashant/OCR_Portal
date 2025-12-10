// public/utils/extractors/aadhaarExtractor.js

const genericExtractor = require("./genericExtractor");

const extractName = require("../regex/nameExtract");
const extractDOB = require("../regex/dobExtract");
const extractGender = require("../regex/genderExtract");
const extractFather = require("../regex/fatherExtract");
const extractEmail = require("../regex/emailExtract");
const extractAddress = require("../regex/addressExtract");
const extractMobile = require("../regex/mobileExtract");
const extractAge = require("../regex/ageExtract");

// Aadhaar strong patterns
const AADHAAR_REGEX = /\b([0-9OIl]{4}[-\s]?[0-9OIl]{4}[-\s]?[0-9OIl]{4})\b/;

// Normalize OCR issues (0↔O, 1↔I)
function fixAadhaarNumber(str) {
  if (!str) return null;
  return str
    .replace(/[O]/g, "0")
    .replace(/[Iil]/g, "1")
    .replace(/[^\d]/g, "")
    .slice(-12);
}

function extractAadhaarID(text) {
  const cleaned = text.replace(/\s+/g, " ");

  // Strong label patterns
  const labelPatterns = [
    /aadhaar\s*number[:\- ]*\s*([0-9OIl\s\-]{12,20})/i,
    /uidai[:\- ]*\s*([0-9OIl\s\-]{12,20})/i,
    /आधार\s*संख्या[:\- ]*\s*([\dOIl\s\-]{12,20})/,
    /आधार\s*नंबर[:\- ]*\s*([\dOIl\s\-]{12,20})/,
  ];

  for (const p of labelPatterns) {
    const m = cleaned.match(p);
    if (m) {
      return fixAadhaarNumber(m[1]);
    }
  }

  // fallback → generic Aadhaar pattern
  const m = cleaned.match(AADHAAR_REGEX);
  return m ? fixAadhaarNumber(m[1]) : null;
}

module.exports = function aadhaarExtractor(text, lang) {
  const cleaned = text.replace(/[|•·=]+/g, " ").replace(/\s{2,}/g, " ");

  const result = {
    idNumber: extractAadhaarID(cleaned),
    name: extractName(cleaned, lang),
    fatherName: extractFather(cleaned, lang),
    dob: extractDOB(cleaned, lang),
    gender: extractGender(cleaned, lang),
    email: extractEmail(cleaned, lang),
    address: extractAddress(cleaned, lang),
    mobile: extractMobile(cleaned, lang),
    age: extractAge(cleaned, lang),
  };

  // fill missing values using generic extractor
  const fallback = genericExtractor(cleaned, lang);
  for (const key in result) {
    if (!result[key]) result[key] = fallback[key];
  }

  return result;
};
