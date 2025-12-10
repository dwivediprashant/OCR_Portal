const Tesseract = require("tesseract.js");
const path = require("path");

async function extractText(imagePath, lang) {
  try {
    const { data } = await Tesseract.recognize(imagePath, lang, {
      cachePath: path.join(__dirname, "../../.cache"),
      logger: (m) => console.log(m),
    });

    console.log("Data keys:", Object.keys(data));
    console.log("Words count:", data.words?.length);
    console.log("First word:", data.words?.[0]);

    // 1. Extract flat words with confidence
    const words = (data.words || []).map((w) => ({
      text: w.text,
      confidence: w.confidence,
      bbox: w.bbox,
    }));

    // 2. Convert TSV into lightweight rows for backup
    const tsvRows = data.tsv
      ? data.tsv
          .split("\n")
          .map((line) => line.split("\t"))
          .filter((cols) => cols.length >= 12)
          .map((cols) => ({
            level: cols[0],
            text: cols[11],
            confidence: Number(cols[10]),
          }))
      : [];

    // 3. Return enhanced OCR data
    return {
      text: data.text || "",
      confidence: data.confidence || 0,
      words, // ← word-level confidence
      tsvRows, // ← TSV extraction backup
      layout: {
        blocks: data.blocks,
        paragraphs: data.paragraphs,
        lines: data.lines,
      },
    };
  } catch (err) {
    throw new Error(err);
  }
}

module.exports = { extractText };
