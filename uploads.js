const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//disk making
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const orgDir = path.join(__dirname, "uploads", "org");
    if (!fs.existsSync(orgDir)) {
      fs.mkdirSync(orgDir, { recursive: true });
    }
    cb(null, orgDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now(); //timestamp

    // just file name no extentions
    const originalName = path.basename(file.originalname, path.extname(file.originalname));
    
    // just extention no file name
    const extension = path.extname(file.originalname);
    cb(null, `${timestamp}_${originalName}${extension}`);
  },
});

const upload = multer({ storage });

// upload path
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// APi to upload and convert videos
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  if (!req.file.mimetype.startsWith("video/")) {
    return res.status(400).json({ error: "Uploaded file is not a video" });
  }

  const inputFilePath = path.join(__dirname, "uploads", "org", req.file.filename);
  const timestamp = req.file.filename.split("_")[0];
  const originalName = path.basename(req.file.filename, path.extname(req.file.filename)).split("_").slice(1).join("_"); // Extract the original name
  const baseOutputDir = path.join(__dirname, "uploads", "dash", `${timestamp}_${originalName}`); // Folder named as `timestamp_originalName`

  const resolutions = [
    { name: "240p", width: 426, height: 240 },
    { name: "480p", width: 854, height: 480 },
    { name: "720p", width: 1280, height: 720 },
    { name: "1080p", width: 1920, height: 1080 },
  ];

  if (!fs.existsSync(baseOutputDir)) {
    fs.mkdirSync(baseOutputDir, { recursive: true });
  }
  

  // convertor funtion
  const transcode = (resolution, callback) => {
    const outputFilePath = path.join(baseOutputDir, `${resolution.name}.mp4`);
    ffmpeg(inputFilePath)
      .output(outputFilePath)
      .size(`${resolution.width}x${resolution.height}`)
      .on("end", () => {
        console.log(`Transcoding to ${resolution.name} complete.`);
        callback(null, { resolution: resolution.name, path: outputFilePath });
      })
      .on("error", (err) => {
        console.error(`Error during ${resolution.name} transcoding:`, err);
        callback(err, null);
      })
      .run();
  };


  // Transcode video for all resolutions
  let completedTasks = 0;
  const transcodedFiles = [];

  resolutions.forEach((resolution) => {
    transcode(resolution, (err, result) => {
      if (err) {
        console.error(`Failed transcoding to ${resolution.name}`);
      } else {
        transcodedFiles.push(result);
      }
      completedTasks++;

      // res when all done
      if (completedTasks === resolutions.length) {
        console.log("All resolutions transcoded successfully.");
        res.status(200).json({ message: "File uploaded, processing started." });
      }
    });
  });
});


app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
