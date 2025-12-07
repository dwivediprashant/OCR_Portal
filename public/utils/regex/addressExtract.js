// ==================== addressExtract.js ====================

function extractAddressFromText(text) {
  if (!text || typeof text !== "string") return null;

  const lines = text.split(/\r?\n/).map((l) => l.trim());

  // Common address labels
  const addrLabel =
    /\b(address|residential\s*address|permanent\s*address|correspondence\s*address|addr)\b[:\-]?\s*(.*)$/i;

  const stopWords = [
    "name",
    "dob",
    "date of birth",
    "father",
    "mother",
    "email",
    "mobile",
    "phone",
    "gender",
    "id",
    "aadhar",
    "aadhaar",
    "pan",
    "passport",
  ];

  let collecting = false;
  let addr = [];

  for (let line of lines) {
    const low = line.toLowerCase();

    // 1. Detect starting line
    if (!collecting) {
      const m = line.match(addrLabel);
      if (m) {
        collecting = true;
        if (m[2]) addr.push(m[2].trim()); // address part on same line
        continue;
      }
    }

    // 2. If already collecting, stop when another field appears
    if (collecting) {
      if (stopWords.some((w) => low.startsWith(w))) break;
      if (/^\s*$/.test(line)) break; // blank line → end of address

      addr.push(line);
    }
  }

  if (!addr.length) return null;

  return addr.join(" ").trim();
}

module.exports = extractAddressFromText;
