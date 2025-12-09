// public/utils/verifyAddress.js

// Convert Hindi digits → English digits
const hindiMap = {
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

function normalize(str) {
  if (!str) return "";

  // Convert Hindi digits
  str = str.replace(/[०-९]/g, (d) => hindiMap[d] || d);

  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ") // remove punctuation & special chars
    .replace(/\s+/g, " ") // squeeze spaces
    .trim();
}

// Simple Levenshtein
function similarity(a, b) {
  if (!a || !b) return 0;
  const m = a.length,
    n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }

  return 1 - dp[m][n] / Math.max(m, n);
}

// Token similarity method
function tokenSimilarity(filledTokens, ocrTokens) {
  let matchCount = 0;

  for (const ft of filledTokens) {
    for (const ot of ocrTokens) {
      if (similarity(ft, ot) >= 0.75) {
        matchCount++;
        break;
      }
    }
  }

  return matchCount / Math.max(filledTokens.length, ocrTokens.length, 1);
}

function verifyAddress(filled, ocr) {
  const result = {
    filled,
    ocr,
    matchScore: 0,
    status: "mismatch",
  };

  const fNorm = normalize(filled);
  const oNorm = normalize(ocr);

  if (!fNorm && !oNorm) {
    result.matchScore = 1;
    result.status = "missing";
    return result;
  }

  if (!fNorm || !oNorm) {
    result.matchScore = 0;
    result.status = "missing";
    return result;
  }

  const fTokens = fNorm.split(" ");
  const oTokens = oNorm.split(" ");

  const score = tokenSimilarity(fTokens, oTokens);
  result.matchScore = Number(score.toFixed(3));

  if (score >= 0.9) result.status = "match";
  else if (score >= 0.65) result.status = "partial";
  else result.status = "mismatch";

  return result;
}

module.exports = verifyAddress;
