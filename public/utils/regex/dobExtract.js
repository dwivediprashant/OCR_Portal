// dobExtract.js

function extractDOBFromText(text) {
  if (!text) return null;

  const pattern =
    /\b(?:dob|d\.?o\.?b\.?|date\s*of\s*birth|birth\s*date|date)\s*[:\-\s]*([0-3]?\d[\/\-. ][0-1]?\d[\/\-. ](19|20)\d{2})(?!\d)/i;

  const match = text.match(pattern);
  if (!match) return null;

  return match[1]; // return clean DOB
}

module.exports = extractDOBFromText;
