const fs = require("fs");
const path = require("path");
const getUploadedFiles = () => {
  const folderPath = path.join(__dirname, "../uploads/documents");
  try {
    const docs = fs.readdirSync(folderPath);
    return docs;
  } catch (err) {
    console.error("Error reading uploads folder:", err);
    return [];
  }
};

module.exports = getUploadedFiles;
