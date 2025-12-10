// public/utils/verifyGender.js

function normalize(str) {
  if (!str) return "";

  str = str.toLowerCase().trim();

  // OCR digit corrections
  str = str.replace(/1/g, "l").replace(/0/g, "o");

  // Hindi → English mappings
  if (["पुरुष"].includes(str)) return "male";
  if (["महिला"].includes(str)) return "female";
  if (["अन्य"].includes(str)) return "other";

  // Exact English mappings
  if (["male", "m"].includes(str)) return "male";
  if (["female", "f"].includes(str)) return "female";
  if (["other", "others", "o"].includes(str)) return "other";

  // Common OCR / spelling mistakes
  if (["maal", "mae"].includes(str)) return "male";
  if (["femal", "femae"].includes(str)) return "female";

  // DO NOT auto-map words like "males" → "male"
  // Instead allow partial logic later

  return str;
}

function verifyGender(filled, ocr) {
  const fRaw = filled || "";
  const oRaw = ocr || "";

  const f = normalize(fRaw);
  const o = normalize(oRaw);

  const result = {
    filled: fRaw,
    ocr: oRaw,
    matchScore: 0,
    status: "mismatch",
  };

  // EMPTY CASES
  if (!f && !o) {
    result.status = "missing";
    result.matchScore = 1;
    return result;
  }

  if (!f && o) {
    result.status = "missing_user";
    return result;
  }

  if (f && !o) {
    result.status = "missing_ocr";
    return result;
  }

  // EXACT MATCH
  if (f === o) {
    result.status = "match";
    result.matchScore = 1;
    return result;
  }

  // PARTIAL MATCH (e.g. "males" vs "male", "females" vs "female")
  if (f.startsWith(o) || o.startsWith(f)) {
    result.status = "partial";
    result.matchScore = 0.7;
    return result;
  }

  // FULL MISMATCH
  return result;
}

module.exports = verifyGender;
