// public/utils/extractors/panExtractor.js

const genericExtractor = require("./genericExtractor");

// load regex extractors directly
const extractName = require("../regex/nameExtract");
const extractDOB = require("../regex/dobExtract");
const extractGender = require("../regex/genderExtract");
const extractFather = require("../regex/fatherExtract");

// PAN-specific ID number pattern
const PAN_REGEX = /\b([A-Z]{5}[0-9]{4}[A-Z])\b/;

// Labels improve extraction accuracy
function extractPANID(text) {
  let cleaned = text.replace(/\s+/g, " ").toUpperCase();

  const labelPatterns = [
    /Permanent\s+Account\s+Number[:\- ]*\s*([A-Z]{5}[0-9]{4}[A-Z])/i,
    /e[- ]?PAN\s*Card.*?([A-Z]{5}[0-9]{4}[A-Z])/i,
    /PAN\s*No[:\- ]*\s*([A-Z]{5}[0-9]{4}[A-Z])/i,
  ];

  for (const p of labelPatterns) {
    const m = cleaned.match(p);
    if (m) return m[1];
  }

  // fallback → generic PAN pattern
  const m = cleaned.match(PAN_REGEX);
  return m ? m[1] : null;
}

module.exports = function panExtractor(text, lang) {
  const cleaned = text.replace(/[|•·=]+/g, " ").replace(/\s{2,}/g, " ");

  let result = {
    name: extractName(cleaned, lang),
    fatherName: extractFather(cleaned, lang),
    dob: extractDOB(cleaned, lang),
    gender: extractGender(cleaned, lang),
    idNumber: extractPANID(cleaned),
    email: null,
    address: null,
    mobile: null,
    age: null,
  };

  return result;
};
