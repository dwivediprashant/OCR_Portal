const sharp = require("sharp");

/**
 * Preprocess image for better OCR accuracy:
 * - convert to grayscale
 * - increase contrast
 * - normalize lighting
 * - apply threshold (binarization)
 * - slight sharpening
 */

async function preprocessImage(buffer) {
  try {
    const processed = await sharp(buffer)
      .grayscale()
      .normalize() // auto-adjust brightness/contrast
      .sharpen() // improves text edges
      .threshold(150) // binarize (experiment: 140–170)
      .toBuffer()
      .gamma();

    return processed;
  } catch (error) {
    console.log("Preprocessing failed, using original image:", error);
    return buffer; // fallback to original
  }
}

module.exports = preprocessImage;
