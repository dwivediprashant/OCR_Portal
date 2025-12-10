const express = require("express");
const app = express();
const port = 3000;
const session = require("express-session");
const flash = require("connect-flash");
const fs = require("fs");
//utils-------------------------------------
const getUploadedFiles = require("./public/utils/getUploadedFiles");
const { extractText } = require("./public//utils/tesseract");
const { extractFields } = require("./public/utils/fieldsRequired");
const normalizeDOB = require("./public/utils/normalizeDOB");
const isPdf = require("./public/utils/isPdf");
const { convertPdf2Img } = require("./public/utils/convertPdf2img");
const preprocessImg = require("./public/utils/preProcessImg");
const { computeFieldConfidence } = require("./public/utils/confidence");

//---------verification utils-----------------------
const similarity = require("./public/utils/verification/similarity");
const verifyDOB = require("./public/utils/verification/verifyDOB");
const verifyMobile = require("./public/utils/verification/verifyMobile");
const verifyIDNumber = require("./public/utils/verification/verifyID");
const verifyName = require("./public/utils/verification/verifyName");
const verifyAge = require("./public/utils/verification/verifyAge");
const verifyAddress = require("./public/utils/verification/verifyAddress");
const verifyGender = require("./public/utils/verification/verifyGender");
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

//----------get page to save file-------------
app.get("/upload", (req, res) => {
  res.render("upload");
});
//------------store file using multer in uploads/documents directory----------------
app.post("/upload", upload.single("document"), (req, res) => {
  console.log(req.file);
  req.flash("success", "File saved successfully");
  res.redirect("/upload");
});
//------------get page to extract data ------------
app.get("/extract", (req, res) => {
  const allFiles = getUploadedFiles();
  res.render("extractDocs", { allFiles });
});
//--------FIRST API : OCR extraction api
//---------------tesseract extract data from saved file such as name, dob, age etc-------------
app.post("/api/extract/:id", async (req, res) => {
  const { id } = req.params;
  const { lang = "eng" } = req.query;
  console.log("Language selected:", lang);
  const filePath = `uploads/documents/${id}`;
  try {
    const pdf = isPdf(filePath);

    let fullText = "";
    let rawDataPerPage = [];
    if (pdf) {
      const bufferImgs = await convertPdf2Img(filePath);
      for (const img of bufferImgs) {
        const processedImg = await preprocessImg(img);
        const data = await extractText(processedImg, lang);
        rawDataPerPage.push(data);
        fullText += "\n" + (data.text || "");
      }
    } else {
      const buffer = fs.readFileSync(filePath);
      const processedBuffer = await preprocessImg(buffer);
      const data = await extractText(processedBuffer, lang);
      rawDataPerPage.push(data);
      fullText += data.text || "";
    }

    const fields = extractFields(fullText);

    // Use page-level confidence (always available)
    const pageConfidences = rawDataPerPage.map((d) => d.confidence || 0);
    const overallConf = pageConfidences.length
      ? Math.round(
          pageConfidences.reduce((a, b) => a + b, 0) / pageConfidences.length
        )
      : 0;

    console.log("Page confidences:", pageConfidences);
    console.log("Overall confidence:", overallConf);

    // Assign same confidence to all fields
    //---------- Per-field confidence scoring ----------
    const out = {};

    for (const key of Object.keys(fields)) {
      const val = fields[key];

      // compute real OCR confidence for this field
      const fieldConf = computeFieldConfidence(val, rawDataPerPage);

      out[key] = {
        value: val,
        confidence: fieldConf,
        matched: val != null,
      };
    }

    req.session.ocrData = fields;
    res.json({ ok: true, fields: out, rawText: fullText });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      error: err.message,
    });
  }
});

//---------get form to edit details------------------
app.get("/detailForm", (req, res) => {
  let ocrData = req.session.ocrData;
  if (!ocrData) {
    req.flash("error", "Please extract data first");
    res.redirect("/extract");
  } else {
    const normalizeDob = normalizeDOB(ocrData.dob);
    ocrData = { ...ocrData, dob: normalizeDob };
    res.render("detailForm", { ocrData });
  }
});

// SECOND API : verification api
app.post("/api/verify", (req, res) => {
  const filled = req.body; //user filled details
  const ocr = req.session.ocrData; //ocr data
  if (!ocr) {
    return res.status(400).json({
      ok: false,
      error: "No OCR data found. Extract data first.",
    });
  }

  const result = {};

  for (const key of Object.keys(ocr)) {
    const userValue = filled[key] || "";
    const ocrValue = ocr[key] || "";
    if (key.toLowerCase() === "dob") {
      const out = verifyDOB(userValue, ocrValue);
      result[key] = out;
      continue;
    }
    if (key.toLowerCase() === "mobile") {
      const out = verifyMobile(userValue, ocrValue);
      result[key] = out;
      continue;
    }
    if (key.toLowerCase() === "gender") {
      const out = verifyGender(userValue, ocrValue);
      result[key] = out;
      continue;
    }
    if (key.toLowerCase() === "idnumber") {
      // EMPTY CASE HANDLING
      if (!userValue && !ocrValue) {
        result[key] = {
          filled: "",
          ocr: "",
          matchScore: 1,
          status: "missing",
        };
        continue;
      }

      if (!userValue && ocrValue) {
        result[key] = {
          filled: "",
          ocr: ocrValue,
          matchScore: 0,
          status: "missing_user",
        };
        continue;
      }

      if (userValue && !ocrValue) {
        result[key] = {
          filled: userValue,
          ocr: "",
          matchScore: 0,
          status: "missing_ocr",
        };
        continue;
      }

      // IF BOTH HAVE VALUE → USE YOUR VERIFY FUNCTION
      const out = verifyIDNumber(userValue, ocrValue);
      result[key] = {
        filled: userValue,
        ocr: ocrValue,
        matchScore: out.matchScore,
        status: out.status,
      };
      continue;
    }

    if (key.toLowerCase() === "name") {
      const out = verifyName(userValue, ocrValue);
      result[key] = out;
      continue;
    }
    if (key.toLowerCase() === "age") {
      const out = verifyAge(userValue, ocrValue, ocr["dob"]);
      result[key] = out;
      continue;
    }
    if (key.toLowerCase() === "address") {
      const out = verifyAddress(userValue, ocrValue);
      result[key] = out;
      continue;
    }

    // --- handle empty cases ---
    if (!userValue && !ocrValue) {
      result[key] = {
        filled: userValue,
        ocr: ocrValue,
        matchScore: 1,
        status: "missing",
      };
      continue;
    }

    if (!userValue && ocrValue) {
      result[key] = {
        filled: userValue,
        ocr: ocrValue,
        matchScore: 0,
        status: "missing_user",
      };
      continue;
    }

    if (userValue && !ocrValue) {
      result[key] = {
        filled: userValue,
        ocr: ocrValue,
        matchScore: 0,
        status: "missing_ocr",
      };
      continue;
    }

    // ---- normal fuzzy matching ----
    const score = similarity(userValue, ocrValue);

    let status = "mismatch";
    if (score >= 0.9) status = "match";
    else if (score >= 0.65) status = "partial";

    result[key] = {
      filled: userValue,
      ocr: ocrValue,
      matchScore: Number(score.toFixed(3)),
      status,
    };
  }

  res.json({
    ok: true,
    verification: result,
  });
});
//------------------------listen route--------------------
app.listen(port, () => {
  console.log("Server running at port " + port);
});
