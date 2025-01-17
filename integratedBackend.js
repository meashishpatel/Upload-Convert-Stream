const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------------- Video Streaming Service (/port1) ---------------------
// Main backend folder where all things will need to read
const videoDir = path.join(__dirname, "uploads", "dash");

// Get available videos
app.get("/port1/videos", (req, res) => {
  try {
    const videoFolders = fs.readdirSync(videoDir).filter((folder) => {
      const folderPath = path.join(videoDir, folder);
      return fs.lstatSync(folderPath).isDirectory();
    });

    const videoFiles = videoFolders.map((folder) => ({ name: folder }));

    res.json(videoFiles);
  } catch (err) {
    console.error("Error reading video directory:", err);
    res.status(500).send("Failed to retrieve video list");
  }
});

// Stream a specific video
app.get("/port1/videos/:folder/:filename", (req, res) => {
  const { folder, filename } = req.params;
  const filePath = path.join(videoDir, folder, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    const chunksize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

// --------------------- File Upload Service (/port2) ---------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const orgDir = path.join(__dirname, "uploads", "org");
    if (!fs.existsSync(orgDir)) {
      fs.mkdirSync(orgDir, { recursive: true });
    }
    cb(null, orgDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const originalName = path.basename(
      file.originalname,
      path.extname(file.originalname)
    );
    const extension = path.extname(file.originalname);
    cb(null, `${timestamp}_${originalName}${extension}`);
  },
});

const upload = multer({ storage });

app.post("/port2/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  if (!req.file.mimetype.startsWith("video/")) {
    return res.status(400).json({ error: "Uploaded file is not a video" });
  }

  const inputFilePath = path.join(
    __dirname,
    "uploads",
    "org",
    req.file.filename
  );
  const timestamp = req.file.filename.split("_")[0];
  const originalName = path
    .basename(req.file.filename, path.extname(req.file.filename))
    .split("_")
    .slice(1)
    .join("_");
  const baseOutputDir = path.join(
    __dirname,
    "uploads",
    "dash",
    `${timestamp}_${originalName}`
  );

  const resolutions = [
    { name: "240p", width: 426, height: 240 },
    { name: "480p", width: 854, height: 480 },
    { name: "720p", width: 1280, height: 720 },
    { name: "1080p", width: 1920, height: 1080 },
  ];

  if (!fs.existsSync(baseOutputDir)) {
    fs.mkdirSync(baseOutputDir, { recursive: true });
  }

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

      if (completedTasks === resolutions.length) {
        console.log("All resolutions transcoded successfully.");
        res.status(200).json({ message: "File uploaded, processing started." });
      }
    });
  });
});

// Start the combined server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
