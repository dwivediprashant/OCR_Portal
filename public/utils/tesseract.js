const Tesseract = require("tesseract.js");
const path = require("path");

async function extractText(imagePath) {
  try {
    const { data } = await Tesseract.recognize(imagePath, "eng", {
      cachePath: path.join(__dirname, "../../.cache"),
      logger: (m) => console.log(m),
    });

    return data.text;
  } catch (err) {
    throw new Error(err);
  }
}

module.exports = { extractText };
