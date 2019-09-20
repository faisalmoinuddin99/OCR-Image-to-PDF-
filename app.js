//Declaration of our Imports
const express = require("express");
const app = express();
const multer = require("multer");
const fs = require("fs");
const { TesseractWorker } = require("tesseract.js");
const worker = new TesseractWorker();
const ejs = require("ejs");
const path = require("path");

//Multer Storage
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
var upload = multer({ storage: storage }).single("avatar");

app.set("view engine", "ejs");
app.use(express.static("public"));

//Routes
app.get("/", (req, res) => {
  res.render("index");
});

app.post("/upload", (req, res) => {
  upload(req, res, err => {
    fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
      if (err) return console.log("This is your error", err);
      worker
        .recognize(data, "eng", { tessjs_create_pdf: "1" })
        .progress(progress => {
          console.log(progress);
        })
        .then(result => {
          res.redirect("/download");
        })
        .finally(() => worker.terminate());
    });
  });
});

app.get("/download", (req, res) => {
  const file = `${__dirname}/tesseract.js-ocr-result.pdf`;
  res.download(file);
});

//Starting Up our server
const PORT = 3000 || process.env.PORT;
app.listen(PORT, () => {
  console.log(`server is running at port :${PORT}`);
});
