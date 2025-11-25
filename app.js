const express = require("express");
const app = express();
const port = 3000;

//utils-------------------------------------
const getUploadedFiles = require("./public/utils/getUploadedFiles");
const { extractText } = require("./public//utils/tesseract");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
// Set EJS as the view engine
app.set("view engine", "ejs");
// Specify the directory where your EJS templates are located
app.set("views", "./views");
//--------storage multer middleware-------------------------
const upload = require("./middlewares/upload");
//------------------------------------------
//-------------serve form using : "/" get -----------
app.get("/", (req, res) => {
  res.render("home");
});
//----------get page to save file-------------
app.get("/saveForm", (req, res) => {
  res.render("saveForm");
});
//------------store file using multer in uploads/documents directory----------------
app.post("/saveForm", upload.single("document"), (req, res) => {
  console.log(req.file);
  res.render("saveForm");
});
//------------get page to extract data ------------
app.get("/extractData", (req, res) => {
  const allFiles = getUploadedFiles();
  res.render("extractDocs", { allFiles });
});
//---------------tesseract extract data from saved file such as name, dob, age etc-------------
app.post("/extractData/:id", async (req, res) => {
  const { id } = req.params;
  const filePath = `uploads/documents/${id}`;
  try {
    const text = await extractText(filePath);
    console.log(text);
    res.send({
      file: id,
      extractedText: text,
    });
  } catch (err) {
    res.status(500).send({
      error: err.message,
    });
  }
});

//------------------------listen route--------------------
app.listen(port, () => {
  console.log("Server running at port " + port);
});
