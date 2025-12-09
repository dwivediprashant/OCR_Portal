// public/utils/verifyGender.js

function normalize(str) {
  if (!str) return "";

  str = str.toLowerCase().trim();

  // OCR corrections
  str = str.replace(/1/g, "l").replace(/0/g, "o");

  // Hindi to English mapping
  if (["पुरुष", "m", "male", "maal", "mae"].includes(str)) return "male";
  if (["महिला", "female", "femal", "f", "femae"].includes(str)) return "female";
  if (["अन्य", "other", "others", "o"].includes(str)) return "other";

  // general fallback
  if (str.startsWith("m")) return "male";
  if (str.startsWith("f")) return "female";
  if (str.startsWith("o")) return "other";

  return str;
}

function verifyGender(filled, ocr) {
  const f = normalize(filled);
  const o = normalize(ocr);

  const result = {
    filled,
    ocr,
    matchScore: 0,
    status: "mismatch",
  };

  if (!f && !o) {
    result.status = "missing";
    result.matchScore = 1;
    return result;
  }

  if (!f || !o) {
    result.status = "missing";
    return result;
  }

  if (f === o) {
    result.status = "match";
    result.matchScore = 1;
  } else {
    result.status = "mismatch";
    result.matchScore = 0;
  }

  return result;
}

module.exports = verifyGender;
