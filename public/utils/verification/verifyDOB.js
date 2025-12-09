// public/utils/verification/verifyDOB.js

const normalizeDOB = require("../normalizeDOB");

// Convert string dd/mm/yyyy into Date safely
function toDate(str) {
  if (!str) return null;
  const parts = str.split("/");
  if (parts.length !== 3) return null;

  let [dd, mm, yy] = parts;

  // Expand 2-digit year
  if (yy.length === 2) {
    yy = Number(yy) <= 30 ? "20" + yy : "19" + yy;
  }

  const iso = `${yy}-${mm}-${dd}`;
  const dt = new Date(iso);

  return isNaN(dt.getTime()) ? null : dt;
}

function compareDates(d1, d2) {
  if (d1.getTime() === d2.getTime()) return 1;

  if (d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear())
    return 0.85;

  if (d1.getFullYear() === d2.getFullYear()) return 0.6;

  const diff = Math.abs(d1 - d2) / (1000 * 60 * 60 * 24);
  if (diff <= 7) return 0.75;

  return 0;
}

function verifyDOB(filled, ocr) {
  const result = {
    filled: filled || "",
    ocr: ocr || "",
    matchScore: 0,
    status: "mismatch",
  };

  if (!filled && !ocr) {
    result.status = "missing";
    result.matchScore = 1;
    return result;
  }

  if (!filled || !ocr) {
    result.status = "missing";
    return result;
  }

  // --- NEW: Use your global normalizeDOB() ---
  const fNorm = normalizeDOB(filled); // YYYY-MM-DD
  const oNorm = normalizeDOB(ocr); // YYYY-MM-DD or null

  // Convert into dd/mm/yyyy for comparison
  const fParts = fNorm.split("-");
  const oParts = oNorm.split("-");

  if (fParts.length !== 3 || oParts.length !== 3) {
    // fallback numeric compare
    const fNum = fNorm.replace(/\D/g, "");
    const oNum = oNorm.replace(/\D/g, "");
    const score = fNum === oNum ? 1 : 0;

    result.matchScore = score;
    result.status = score === 1 ? "match" : "mismatch";
    return result;
  }

  const fDate = toDate(`${fParts[2]}/${fParts[1]}/${fParts[0]}`);
  const oDate = toDate(`${oParts[2]}/${oParts[1]}/${oParts[0]}`);

  if (!fDate || !oDate) {
    const score = 0;
    result.matchScore = 0;
    result.status = "mismatch";
    return result;
  }

  const score = compareDates(fDate, oDate);

  result.matchScore = Number(score.toFixed(3));

  if (score >= 0.9) result.status = "match";
  else if (score >= 0.6) result.status = "partial";
  else result.status = "mismatch";

  return result;
}

module.exports = verifyDOB;
