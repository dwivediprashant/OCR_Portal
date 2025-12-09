// public/utils/verifyName.js

function normalize(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/[^a-z\s]/g, "") // remove special chars & digits
    .replace(/\s+/g, " ")
    .trim();
}

// simple Levenshtein distance
function levenshtein(a, b) {
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

  const dist = dp[m][n];
  return 1 - dist / Math.max(m, n); // normalized score
}

// token similarity
function tokenScore(filled, ocr) {
  const fTokens = filled.split(" ").filter(Boolean);
  const oTokens = ocr.split(" ").filter(Boolean);

  let matchCount = 0;

  for (let ft of fTokens) {
    for (let ot of oTokens) {
      if (levenshtein(ft, ot) >= 0.8) {
        // token fuzzy match
        matchCount++;
        break;
      }
    }
  }

  return matchCount / Math.max(fTokens.length, oTokens.length, 1);
}

function verifyName(filled, ocr) {
  const result = {
    filled,
    ocr,
    matchScore: 0,
    status: "mismatch",
  };

  const f = normalize(filled);
  const o = normalize(ocr);

  if (!f && !o) {
    result.status = "missing";
    result.matchScore = 1;
    return result;
  }

  if (!f || !o) {
    result.status = "missing";
    return result;
  }

  const charSim = levenshtein(f, o); // character level
  const tokSim = tokenScore(f, o); // word level

  const finalScore = charSim * 0.5 + tokSim * 0.5;

  result.matchScore = Number(finalScore.toFixed(3));

  if (finalScore >= 0.9) result.status = "match";
  else if (finalScore >= 0.65) result.status = "partial";
  else result.status = "mismatch";

  return result;
}

module.exports = verifyName;
