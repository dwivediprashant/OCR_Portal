// ----------------- helper utils for per-field confidence -----------------

function normToken(t) {
  if (!t) return "";
  return t
    .toString()
    .replace(/[:.,\-/\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function fieldTokens(value) {
  if (!value) return [];
  return normToken(value).split(" ").filter(Boolean);
}

function mergeWords(rawDataPerPage) {
  const all = [];
  for (let p = 0; p < rawDataPerPage.length; p++) {
    const d = rawDataPerPage[p] || {};
    const words = Array.isArray(d.words)
      ? d.words
      : (d.tsvRows || []).map((r) => ({
          text: String(r.text || ""),
          confidence: Number(r.confidence || 0),
          bbox: null,
        }));

    for (const w of words) {
      all.push({
        text: (w.text || "").toString(),
        conf: Number(w.confidence || w.conf || 0),
        bbox: w.bbox || null,
        page: p,
      });
    }
  }
  return all;
}

function computeFieldConfidence(fieldValue, rawDataPerPage) {
  if (!fieldValue) return 0;

  const tokens = fieldTokens(fieldValue);
  if (tokens.length === 0) return 0;

  const words = mergeWords(rawDataPerPage);
  if (!words || words.length === 0) return 0;

  const matchedConfs = [];

  const wordTextUpper = words.map((w) => w.text.toUpperCase());
  for (const tok of tokens) {
    let found = false;

    // 1. exact match
    for (let i = 0; i < wordTextUpper.length; i++) {
      if (wordTextUpper[i] === tok) {
        matchedConfs.push(words[i].conf);
        found = true;
        break;
      }
    }
    if (found) continue;

    // 2. contains / startsWith
    for (let i = 0; i < wordTextUpper.length; i++) {
      if (wordTextUpper[i].includes(tok) || tok.includes(wordTextUpper[i])) {
        matchedConfs.push(words[i].conf * 0.9);
        found = true;
        break;
      }
    }
    if (found) continue;

    // 3. numeric partial match
    if (/^\d+$/.test(tok)) {
      for (let i = 0; i < wordTextUpper.length; i++) {
        const w = wordTextUpper[i].replace(/\D/g, "");
        if (w && w.includes(tok)) {
          matchedConfs.push(words[i].conf * 0.85);
          found = true;
          break;
        }
      }
    }
  }

  if (matchedConfs.length === 0) {
    // page-level fallback
    const fieldNorm = normToken(fieldValue);

    for (const page of rawDataPerPage) {
      const pageText = normToken(page?.text || "");
      if (!pageText.includes(fieldNorm)) continue;

      const pageWords = Array.isArray(page.words)
        ? page.words
        : (page.tsvRows || []).map((r) => ({
            text: String(r.text || ""),
            confidence: Number(r.confidence || 0),
          }));

      const pWordsUpper = pageWords.map((w) => w.text.toUpperCase());
      const pageMatches = [];

      for (const tok of tokens) {
        for (let i = 0; i < pWordsUpper.length; i++) {
          if (
            pWordsUpper[i] === tok ||
            pWordsUpper[i].includes(tok) ||
            tok.includes(pWordsUpper[i])
          ) {
            pageMatches.push(pageWords[i].confidence || 0);
            break;
          }
        }
      }

      if (pageMatches.length) {
        return Math.round(
          pageMatches.reduce((a, b) => a + b, 0) / pageMatches.length
        );
      }
    }

    return 0;
  }

  return Math.round(
    matchedConfs.reduce((a, b) => a + b, 0) / matchedConfs.length
  );
}

module.exports = {
  normToken,
  fieldTokens,
  mergeWords,
  computeFieldConfidence,
};
