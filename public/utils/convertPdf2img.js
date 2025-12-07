const convertPdf2Img = async (filePath) => {
  try {
    console.log("Converting:", filePath);

    // Import ESM module inside CommonJS:
    const { pdf } = await import("pdf-to-img");

    // Load document (async iterable)
    const document = await pdf(filePath, { scale: 3 });

    const buffers = [];
    let index = 1;

    // Each `image` is already a Buffer according to docs
    for await (const image of document) {
      console.log(`Page ${index} buffer size: ${image.length}`);
      buffers.push(image);
      index++;
    }

    console.log("Total pages:", buffers.length);
    console.log(buffers);
    return buffers;
  } catch (err) {
    console.error("PDF converter error:", err);
    throw err;
  }
};

module.exports = { convertPdf2Img };
