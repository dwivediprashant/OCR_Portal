const Tesseract = require("tesseract.js");

async function extractText(imagePath) {
  try {
    const { data } = await Tesseract.recognize(imagePath, "eng", {
      logger: (m) => console.log(m), // progress log (optional)
    });

    return data.text;
  } catch (err) {
    throw new Error(err);
  }
}

module.exports = { extractText };
