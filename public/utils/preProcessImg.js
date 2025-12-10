// public/utils/preProcessImg.js
const sharp = require("sharp");

/**
 * Preprocess image buffer for Tesseract.
 * - Upscale small images
 * - Convert to greyscale
 * - Adjust contrast/brightness
 * - Optional binarization (threshold) depending on docType
 *
 * You can pass: { docType: "PAN" | "AADHAAR" | "CERTIFICATE" | "OTHER" }
 */
async function preprocessImg(inputBuffer, opts = {}) {
  const { docType } = opts || {};

  // ---------- 1. Base profile (generic) ----------
  let profile = {
    targetWidth: 1600,
    contrast: 1.15,
    brightness: 1.03,
    gamma: 1.0,
    sharpenSigma: 1.0,
    threshold: 150,
    applyThreshold: true,
  };

  // ---------- 2. docType-specific overrides ----------
  if (docType === "PAN") {
    // PAN: high contrast, strong edges, clear text
    profile = {
      targetWidth: 1800,
      contrast: 1.25,
      brightness: 1.05,
      gamma: 0.9,
      sharpenSigma: 1.5,
      threshold: 160,
      applyThreshold: true,
    };
  } else if (docType === "AADHAAR") {
    // Aadhaar: mixed Hindi/English → avoid hard thresholding
    profile = {
      targetWidth: 1700,
      contrast: 1.1,
      brightness: 1.02,
      gamma: 1.1,
      sharpenSigma: 0.8,
      threshold: 140,
      applyThreshold: false, // important: keep curves of Devanagari
    };
  } else if (docType === "CERTIFICATE") {
    // Certificates: decorative fonts, colored background → no threshold
    profile = {
      targetWidth: 1600,
      contrast: 1.05,
      brightness: 1.03,
      gamma: 1.0,
      sharpenSigma: 0.3,
      threshold: 150,
      applyThreshold: false,
    };
  }
  // else OTHER/undefined → use base profile

  try {
    // ---------- 3. Read metadata to decide resize ----------
    const meta = await sharp(inputBuffer).metadata();

    const resizeOpts = {};
    if (meta.width && meta.width < profile.targetWidth) {
      resizeOpts.width = profile.targetWidth;
    }

    // ---------- 4. Main pipeline ----------
    let img = sharp(inputBuffer)
      .resize(resizeOpts)
      .rotate() // auto-orient using EXIF
      .greyscale()
      // boost contrast: y = contrast * x + bias
      .linear(profile.contrast, -(256 * (profile.contrast - 1) * 0.5))
      .modulate({ brightness: profile.brightness })
      .gamma(profile.gamma)
      .sharpen(profile.sharpenSigma)
      .normalize(); // normalize histogram

    // Intermediate greyscale buffer
    let out = await img.toFormat("png").toBuffer();

    // ---------- 5. Optional binarization ----------
    if (profile.applyThreshold) {
      out = await sharp(out)
        .threshold(profile.threshold)
        .toFormat("png")
        .toBuffer();
    }

    return out;
  } catch (err) {
    console.error("Preprocess error, returning original buffer:", err);
    return inputBuffer; // fallback so OCR still runs
  }
}

module.exports = preprocessImg;
