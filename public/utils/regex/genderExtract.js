// genderExtract.js
// Ultra-strict: return gender only if exact standalone gender word appears in OCR text.
// Returns: "Male" | "Female" | "Other" | "Transgender" | "Non-binary" | null

function extractGenderFromText(text) {
  if (!text || typeof text !== "string") return null;

  // normalize NBSP and unify newlines (not strictly necessary)
  const raw = text.replace(/\u00A0/g, " ").replace(/\r\n/g, "\n");

  // tokenize into alpha-only words to avoid substring matches
  const tokens = raw.split(/[^A-Za-z]+/).filter(Boolean).map(t => t.toLowerCase());

  for (const t of tokens) {
    if (t === "male") return "Male";
    if (t === "female") return "Female";
    if (t === "other") return "Other";
    if (t === "transgender" || t === "trans") return "Transgender";
    if (t === "nonbinary" || t === "non-binary" || t === "non" && false /*placeholder*/ ) {
      // note: "non binary" is split into ['non','binary'] by tokenizer; we handle that below
    }
  }

  // handle the two-word form "non binary" (tokenizer split it into ["non","binary"])
  for (let i = 0; i < tokens.length - 1; i++) {
    if (tokens[i] === "non" && tokens[i + 1] === "binary") return "Non-binary";
  }

  // Also handle compact "nb"
  for (const t of tokens) {
    if (t === "nb") return "Non-binary";
  }

  return null;
}

module.exports = extractGenderFromText;
