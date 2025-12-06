function normalizeDOB(dob) {
  if (!dob) return null;

  // Replace . / space with -
  dob = dob.replace(/[\./\s]/g, "-");

  // Split
  const parts = dob.split("-");

  // If user format: yyyy-mm-dd
  if (parts[0].length === 4) {
    const [yyyy, mm, dd] = parts;
    return `${yyyy.padStart(4, "0")}-${mm.padStart(2, "0")}-${dd.padStart(
      2,
      "0"
    )}`;
  }

  // If OCR format: dd-mm-yyyy
  if (parts[2].length === 4) {
    const [dd, mm, yyyy] = parts;
    return `${yyyy.padStart(4, "0")}-${mm.padStart(2, "0")}-${dd.padStart(
      2,
      "0"
    )}`;
  }

  return dob; // fallback (rare)
}

module.exports = normalizeDOB;
