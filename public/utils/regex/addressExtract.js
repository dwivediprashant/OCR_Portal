// ==================== addressExtract.js ====================

function extractAddressFromText(text) {
  if (!text || typeof text !== "string") return null;

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // English + Hindi address labels
  const addrLabel =
    /\b(address|residential\s*address|permanent\s*address|correspondence\s*address|addr|पता|स्थायी\s*पता|पत्र\s*व्यवहार\s*का\s*पता)\b[:\-]?\s*(.*)$/i;

  // Stop capturing when these appear
  const stopWords = [
    "name",
    "father",
    "mother",
    "dob",
    "date of birth",
    "gender",
    "email",
    "mobile",
    "phone",
    "id",
    "aadhar",
    "aadhaar",
    "pan",
    "passport",
    "pin",
    "pincode",
    "district",
    "state",
  ];

  let collecting = false;
  let addr = [];

  for (let line of lines) {
    const low = line.toLowerCase();

    // ------------------------------------------
    // 1. Find the starting label
    // ------------------------------------------
    if (!collecting) {
      const m = line.match(addrLabel);
      if (m) {
        collecting = true;

        // If something exists after the label → push it
        if (m[2] && m[2].trim().length > 0) {
          addr.push(m[2].trim());
        }
        continue;
      }
    }

    // ------------------------------------------
    // 2. If collecting, determine stop conditions
    // ------------------------------------------
    if (collecting) {
      // Stop if next field label appears
      if (stopWords.some((w) => low.startsWith(w))) break;

      // Stop if line is too short (junk OCR)
      if (line.length <= 2) break;

      // Stop on pure alphanumeric field-like patterns
      if (/^(name|dob|father|gender)\s*[:\-]$/i.test(low)) break;

      addr.push(line);
    }
  }

  if (!addr.length) return null;

  return addr.join(" ").trim();
}

module.exports = extractAddressFromText;
