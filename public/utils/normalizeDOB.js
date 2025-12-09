function normalizeDOB(dob) {
  if (!dob) return null;

  // Remove all spaces
  dob = dob.trim().replace(/\s+/g, "");

  // Replace . and / with -
  dob = dob.replace(/[./]/g, "-");

  const parts = dob.split("-");

  // Case 1: YYYY-MM-DD
  if (parts.length === 3 && parts[0].length === 4) {
    const [yyyy, mm, dd] = parts;
    return `${yyyy.padStart(4, "0")}-${mm.padStart(2, "0")}-${dd.padStart(
      2,
      "0"
    )}`;
  }

  // Case 2: DD-MM-YYYY
  if (parts.length === 3 && parts[2].length === 4) {
    const [dd, mm, yyyy] = parts;
    return `${yyyy.padStart(4, "0")}-${mm.padStart(2, "0")}-${dd.padStart(
      2,
      "0"
    )}`;
  }

  // Case 3: ddmmyyyy → 25102006
  if (/^\d{8}$/.test(dob)) {
    const dd = dob.slice(0, 2);
    const mm = dob.slice(2, 4);
    const yyyy = dob.slice(4);
    return `${yyyy}-${mm}-${dd}`;
  }

  // Case 4: yyyymmdd → 20061025
  if (/^\d{8}$/.test(dob) && dob.slice(0, 4) > "1900") {
    const yyyy = dob.slice(0, 4);
    const mm = dob.slice(4, 6);
    const dd = dob.slice(6);
    return `${yyyy}-${mm}-${dd}`;
  }

  // Fallback → return null (invalid format)
  return null;
}

module.exports = normalizeDOB;
