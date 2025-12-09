const Tesseract = require("tesseract.js");
const path = require("path");

async function extractText(imagePath, lang) {
  try {
    const { data } = await Tesseract.recognize(imagePath, lang, {
      cachePath: path.join(__dirname, "../../.cache"),
      logger: (m) => console.log(m),
    });

    console.log("Data keys:", Object.keys(data)); // Debug
    console.log("Words count:", data.words?.length); // Debug
    console.log("First word:", data.words?.[0]); // Debug

    return data;
  } catch (err) {
    throw new Error(err);
  }
}

module.exports = { extractText };
