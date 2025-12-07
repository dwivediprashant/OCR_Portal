const express = require("express");
const app = express();
const port = 3000;
const session = require("express-session");
const flash = require("connect-flash");
//utils-------------------------------------
const getUploadedFiles = require("./public/utils/getUploadedFiles");
const { extractText } = require("./public//utils/tesseract");
const { extractFields } = require("./public/utils/fieldsRequired");
const normalizeDOB = require("./public/utils/normalizeDOB");
const isPdf = require("./public/utils/isPdf");
const { convertPdf2Img } = require("./public/utils/convertPdf2img");
//---middlewares
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "y43jdn%3ydn&&&*****65nkkfnvkkf",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});
// Set EJS as the view engine
app.set("view engine", "ejs");
// Specify the directory where  EJS templates are located
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
  req.flash("success", "File saved successfully");
  res.redirect("/saveForm");
});
//------------get page to extract data ------------
app.get("/extractData", (req, res) => {
  const allFiles = getUploadedFiles();
  res.render("extractDocs", { allFiles });
});
//---------------tesseract extract data from saved file such as name, dob, age etc-------------
app.get("/extractData/:id", async (req, res) => {
  const { id } = req.params;
  const filePath = `uploads/documents/${id}`;
  try {
    const pdf = isPdf(filePath);

    let text = "";
    if (pdf) {
      const bufferImgs = await convertPdf2Img(filePath);
      for (img of bufferImgs) {
        const pageText = await extractText(img);
        text += "\n" + pageText;
      }
    } else {
      text = await extractText(filePath);
    }

    const fieldsRequired = extractFields(text); //by regex
    req.session.ocrData = fieldsRequired;
    res.render("showExtractedData", { id, text, fieldsRequired });
  } catch (err) {
    res.status(500).send({
      error: err.message,
    });
  }
});
//---------get form to fill details------------------
app.get("/detailForm", (req, res) => {
  let ocrData = req.session.ocrData;
  if (!ocrData) {
    req.flash("error", "Please extract data first");
    res.redirect("/extractData");
  } else {
    const normalizeDob = normalizeDOB(ocrData.dob);
    ocrData = { ...ocrData, dob: normalizeDob };
    res.render("detailForm", { ocrData });
  }
});

//---------verify filled details and compare with document(image) extracted details
app.post("/verifyDetails", (req, res) => {
  let { name, dob, email, gender, mobile, address, fatherName } = req.body;
  console.log(name, dob, email, gender, mobile, address, fatherName);
  const normalizeFilledDOB = normalizeDOB(dob);
  const ocrDOB = req.session.ocrData.dob;
  const normalizeOcrDOB = normalizeDOB(ocrDOB);
  console.log(req.session.ocrData);
  res.render("verifyDetails", {
    name,
    dob: normalizeFilledDOB,
    email,
    gender,
    mobile,
    address,
    fatherName,
    ocrData: { ...req.session.ocrData, dob: normalizeOcrDOB },
  });
  // res.json({ name, dob, email, gender, mobile, address, fatherName });
});
//------------------------listen route--------------------
app.listen(port, () => {
  console.log("Server running at port " + port);
});
