// public/utils/detectDocType.js

// Possible outputs:
// "PANCARD", "AADHAAR", "CERTIFICATE", "FORM", "GENERIC"

function detectDocType(text, lang = "eng") {
  if (!text || typeof text !== "string") return "GENERIC";

  const t = text.toLowerCase();

  // ---------------- PAN CARD ----------------
  // English + some Hindi PAN cues
  const panPatterns = [
    /income\s*tax\s*department/i,
    /permanent\s+account\s+number/i,
    /\b[a-z]{5}\d{4}[a-z]\b/i, // PAN format: ABCDE1234F
    /e-pan/i,
    /govt\.\s*of\s*india/i,
    /स्थायी\s+लेखा\s+संख्या/i,
  ];

  if (panPatterns.some((re) => re.test(text))) {
    return "PANCARD";
  }

  // ---------------- AADHAAR ----------------
  const aadhaarPatterns = [
    /\b\d{4}\s\d{4}\s\d{4}\b/, // 1234 5678 9012
    /uidai/i,
    /unique\s+identification\s+authority/i,
    /आधार\s*संख्या/i,
    /आधार\s*कार्ड/i,
  ];

  if (aadhaarPatterns.some((re) => re.test(text))) {
    return "AADHAAR";
  }

  // ---------------- CERTIFICATE ----------------
  // ---------------- CERTIFICATE ----------------
  const certPatterns = [
    /certificate/i,
    /certificat[e|ion|e of]/i,
    /certif[i1]cate/i, // OCR variants
    /certif[i1]cat[e3]/i,
    /cert[i1]f[i1]cate/i,
    /cert[i1]f[i1]c[a4]te/i,

    /achievement/i,
    /certificate\s+of\s+achievement/i,
    /of\s+achievement/i,

    /this\s+certificate\s+proudly\s+presented\s+to/i,
    /presented\s+to/i,
    /is\s+hereby\s+awarded/i,
    /has\s+successfully\s+completed/i,
    /completion\s+certificate/i,
    /merit\s+certificate/i,
    /participation\s+certificate/i,

    // Hindi patterns
    /प्रमाण[-\s]*पत्र/i,
    /प्रमाणित\s*किया\s*जाता\s*है/i,
    /प्रमाण\s*पत्र/i,

    // OCR-mangled words matched loosely
    /\b[a-z]{0,3}rdtt?etc?ate\b/i, // matches "RDTTETC ATE"
    /\bcert[o0]?\w{3,8}ate\b/i,
    /\bcer\w{2,12}ate\b/i,
  ];

  if (certPatterns.some((re) => re.test(text))) {
    return "CERTIFICATE";
  }

  // ---------------- FORM / APPLICATION ----------------
  const formPatterns = [
    /application\s+form/i,
    /registration\s+form/i,
    /application\s+for\s+/i,
    /प्रार्थना\s*पत्र/i,
    /आवेदन\s*पत्र/i,
  ];

  if (formPatterns.some((re) => re.test(text))) {
    return "FORM";
  }

  // Fallback
  return "GENERIC";
}

module.exports = detectDocType;
