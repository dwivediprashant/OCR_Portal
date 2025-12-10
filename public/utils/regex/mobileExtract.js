function extractMobileFromText(text, lang = "eng", docType = "GENERIC") {
  if (!text || typeof text !== "string") return null;

  // Hindi digits → English digits
  const hindiDigits = {
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
  let normalized = text.replace(/[०-९]/g, (d) => hindiDigits[d] || d);

  const lines = normalized.split(/\r?\n/).map((l) => l.trim());

  const labelRegex =
    /\b(mobile|mobile\s*no|phone|phone\s*number|contact|फोन|मोबाइल|संपर्क)\b/i;

  const numberPattern = /(?:\+?\d[\d\s\-()]{4,20}\d)/g;

  const clean = (x) => x.replace(/[^\d]/g, "");

  // STRICT INDIAN VALIDATION (for PAN, AADHAAR, GOV IDs)
  const isValidIndianMobile = (num) => {
    if (num.startsWith("91") && num.length > 10) num = num.slice(2);
    if (num.startsWith("0") && num.length > 10) num = num.slice(1);
    return /^[6-9][0-9]{9}$/.test(num);
  };

  // GENERIC VALIDATION (fallback for certificates, letters, forms)
  const isValidGenericPhone = (num) => num.length >= 5 && num.length <= 15;

  const isValid = (num) => {
    return docType === "PAN" || docType === "AADHAAR"
      ? isValidIndianMobile(num) // STRICT
      : isValidIndianMobile(num) || isValidGenericPhone(num); // FLEXIBLE
  };

  // 1. Label-based search
  for (let line of lines) {
    if (!labelRegex.test(line)) continue;

    const matches = line.match(numberPattern);
    if (!matches) continue;

    for (let m of matches) {
      const num = clean(m);
      if (isValid(num)) return num;
    }
  }

  // 2. Full-text fallback
  const matches = normalized.match(numberPattern);
  if (matches) {
    for (let m of matches) {
      const num = clean(m);
      if (isValid(num)) return num;
    }
  }

  return null;
}

module.exports = extractMobileFromText;
