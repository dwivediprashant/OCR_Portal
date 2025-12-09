function levenshtein(a, b) {
  if (!a || !b) return a === b ? 1 : 0;

  a = a.toString().trim().toLowerCase();
  b = b.toString().trim().toLowerCase();

  const m = a.length;
  const n = b.length;

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

  const distance = dp[m][n];
  const maxLen = Math.max(m, n);

  return 1 - distance / maxLen; // score 0→1
}

module.exports = levenshtein;
