// public/utils/verifyAge.js
// Numeric verification with optional DOB cross-check.

function normalizeAge(str) {
  if (!str) return "";

  // Hindi digits
  const hindi = {
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
  str = str.replace(/[०-९]/g, (d) => hindi[d] || d);

  // OCR mistakes
  str = str.replace(/[lI|]/g, "1").replace(/O/g, "0");

  // remove non-digits
  return str.replace(/\D/g, "");
}

function computeAgeFromDOB(dob) {
  if (!dob) return null;
  const parts = dob.split("/");
  if (parts.length !== 3) return null;

  let dd = parts[0],
    mm = parts[1],
    yy = parts[2];

  if (yy.length === 2) {
    yy = Number(yy) <= 30 ? "20" + yy : "19" + yy;
  }

  const birthDate = new Date(`${yy}-${mm}-${dd}`);
  if (isNaN(birthDate.getTime())) return null;

  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();

  // adjust if birthday not reached this year
  const hasBirthday =
    now.getMonth() > birthDate.getMonth() ||
    (now.getMonth() === birthDate.getMonth() &&
      now.getDate() >= birthDate.getDate());

  if (!hasBirthday) age--;

  return age;
}

function verifyAge(filledAge, ocrAge, ocrDOB) {
  const result = {
    filled: filledAge || "",
    ocr: ocrAge || "",
    matchScore: 0,
    status: "mismatch",
  };

  const f = normalizeAge(filledAge);
  const o = normalizeAge(ocrAge);

  if (!f && !o) {
    result.status = "missing";
    result.matchScore = 1;
    return result;
  }

  if (!f || !o) {
    result.status = "missing";
    return result;
  }

  const fNum = Number(f);
  const oNum = Number(o);

  // direct comparison
  const diff = Math.abs(fNum - oNum);

  if (diff === 0) {
    result.matchScore = 1;
    result.status = "match";
  } else if (diff <= 1) {
    result.matchScore = 0.7;
    result.status = "partial";
  } else {
    result.matchScore = 0;
    result.status = "mismatch";
  }

  // Optional DOB consistency check (does NOT change status)
  if (ocrDOB) {
    const computed = computeAgeFromDOB(ocrDOB);
    if (computed !== null) {
      result.computedFromDOB = computed;
      result.dobAgeDifference = Math.abs(computed - oNum);
    }
  }

  return result;
}

module.exports = verifyAge;
