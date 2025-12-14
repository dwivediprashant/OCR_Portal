// public/utils/extractors/certificateExtractor.js

const extractName = require("../regex/nameExtract");

module.exports = function certificateExtractor(text, lang) {
  const cleaned = text
    .replace(/[|•·=]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  // Extract ONLY Name
  const name = extractName(cleaned, lang);

  return {
    name: name,
    fatherName: null,
    dob: null,
    gender: null,
    idNumber: null,
    email: null,
    address: null,
    mobile: null,
    age: null,
  };
};
