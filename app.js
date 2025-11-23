const express = require("express");
const app = express();

const port = 3000;

//css
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
  res.render("form");
});
//------------storing file using multer in uploads/documents directory----------------
app.post("/storeFile", upload.single("document"), (req, res) => {
  console.log(req.file);
  res.redirect("/");
});

//------------------------listen route--------------------
app.listen(port, () => {
  console.log("Server running at port " + port);
});
