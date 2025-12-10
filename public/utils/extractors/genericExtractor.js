const extractNameFromText = require("../regex/nameExtract");
const extractDOBFromText = require("../regex/dobExtract");
const extractIDNumber = require("../regex/idNumberExtract");
const extractGenderFromText = require("../regex/genderExtract");
const extractFatherNameFromText = require("../regex/fatherExtract");
const extractEmailFromText = require("../regex/emailExtract");
const extractAddressFromText = require("../regex/addressExtract");
const extractMobileFromText = require("../regex/mobileExtract");
const extractAgeFromText = require("../regex/ageExtract");

module.exports = function genericExtractor(text, lang) {
  const result = {};

  const fieldExtractors = {
    name: extractNameFromText,
    dob: extractDOBFromText,
    idNumber: extractIDNumber,
    gender: extractGenderFromText,
    fatherName: extractFatherNameFromText,
    email: extractEmailFromText,
    address: extractAddressFromText,
    mobile: extractMobileFromText,
    age: extractAgeFromText,
  };

  for (let key in fieldExtractors) {
    let value = fieldExtractors[key](text, lang);

    if (!value) {
      result[key] = null;
      continue;
    }

    value = value.toString().trim();

    switch (key) {
      case "mobile":
        value = value.replace(/[^0-9]/g, "");
        if (value.startsWith("91") && value.length > 10) {
          value = value.slice(2);
        }
        result[key] = value.slice(-10);
        break;

      case "email":
        result[key] = value.replace(",", ".").toLowerCase().trim();
        break;

      case "address":
        result[key] = value
          .replace(/\n+/g, " ")
          .replace(/\s{2,}/g, " ")
          .replace(/[,\.]\s*[,\.]/g, ",")
          .trim();
        break;

      case "dob":
        value = value.replace(/\s+/g, "").replace(/[-.]/g, "/");
        if (/^\d{2}\/\d{2}\/\d{2}$/.test(value)) {
          value = value.replace(/\/(\d{2})$/, "/20$1");
        }
        result[key] = value.trim();
        break;

      case "name":
      case "fatherName":
        result[key] = value
          .replace(/\s{2,}/g, " ")
          .replace(/\b([a-z])/g, (m) => m.toUpperCase())
          .trim();
        break;

      case "idNumber":
        result[key] = value.replace(/\s+/g, "").toUpperCase().trim();
        break;

      case "age":
        let age = value.replace(/[^0-9]/g, "");
        if (age === "O") age = "0";
        if (age === "l" || age === "I") age = "1";

        const ageNum = parseInt(age, 10);
        result[key] =
          !ageNum || ageNum < 1 || ageNum > 120 ? null : ageNum.toString();
        break;

      default:
        result[key] = value.trim();
    }
  }

  return result;
};
