// Router for type-specific extraction

const panExtractor = require("./extractors/panExtractor");
const aadhaarExtractor = require("./extractors/aadhaarExtractor");
const certificateExtractor = require("./extractors/certificateExtractor");
const genericExtractor = require("./extractors/genericExtractor");

// text = OCR text, lang = "eng"/"hin", docType = "PAN" | "AADHAAR" | "CERTIFICATE" | ...
function extractFields(text, lang, docType) {
  switch (docType) {
    case "PANCARD":
      return panExtractor(text, lang);

    case "AADHAAR":
      return aadhaarExtractor(text, lang);

    case "CERTIFICATE":
      return certificateExtractor(text, lang);

    default:
      // fallback for unknown / generic documents
      return genericExtractor(text, lang);
  }
}

module.exports = { extractFields };
