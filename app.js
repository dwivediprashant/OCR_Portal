const express = require("express");
const app = express();
const port = 3000;
// Set EJS as the view engine
app.set("view engine", "ejs");
// Specify the directory where your EJS templates are located
app.set("views", "./views");

app.get("/", (req, res) => {
  res.render("home");
});
app.listen(port, () => {
  console.log("Server running");
});
