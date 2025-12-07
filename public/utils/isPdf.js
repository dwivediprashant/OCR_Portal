const path = require("path");
const isPdf = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  console.log(ext);
  return ext === ".pdf";
};

module.exports = isPdf;
