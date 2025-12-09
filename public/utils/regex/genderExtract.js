// genderExtract.js
// Returns the SAME language detected from OCR (Hindi or English)

function extractGenderFromText(text) {
  if (!text || typeof text !== "string") return null;

  const cleaned = text.replace(/\u00A0/g, " ").replace(/\r\n/g, "\n");

  const tokens = cleaned
    .split(/[^A-Za-z\u0900-\u097F]+/)
    .filter(Boolean)
    .map((t) => t.toLowerCase());

  // ---- Hindi detection (return Hindi directly) ----
  if (tokens.includes("पुरुष")) return "पुरुष";
  if (tokens.includes("महिला")) return "महिला";
  if (tokens.includes("अन्य")) return "अन्य";
  if (tokens.includes("ट्रांसजेंडर")) return "ट्रांसजेंडर";

  // ---- English detection (return English directly) ----
  if (tokens.includes("male")) return "Male";
  if (tokens.includes("female")) return "Female";
  if (tokens.includes("other")) return "Other";
  if (tokens.includes("transgender") || tokens.includes("trans"))
    return "Transgender";

  // non-binary (both forms)
  if (tokens.includes("nonbinary") || tokens.includes("non-binary"))
    return "Non-binary";

  for (let i = 0; i < tokens.length - 1; i++) {
    if (tokens[i] === "non" && tokens[i + 1] === "binary") {
      return "Non-binary";
    }
  }

  if (tokens.includes("nb")) return "Non-binary";

  return null;
}

module.exports = extractGenderFromText;
