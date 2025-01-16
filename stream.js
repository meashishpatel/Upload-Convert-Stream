const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5500;

app.use(cors());

// main backend folder where all things will need to read
const videoDir = path.join(__dirname, "uploads", "dash");

// Api
app.get("/videos", (req, res) => {
  try {
    // Read the `dash` folder and retrieve videos grouped by folders
    const videoFolders = fs.readdirSync(videoDir).filter((folder) => {
      const folderPath = path.join(videoDir, folder);
      return fs.lstatSync(folderPath).isDirectory(); // Ensure it's a directory
    });

    const videoFiles = videoFolders.map((folder) => {
      return {
        name: folder,
      };
    });

    res.json(videoFiles);
  } catch (err) {
    console.error("Error reading video directory:", err);
    res.status(500).send("Failed to retrieve video list");
  }
});

// Api to stream video
app.get("/videos/:folder/:filename", (req, res) => {
  const folder = req.params.folder;
  const fileName = req.params.filename;
  const filePath = path.join(videoDir, folder, fileName);

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

app.listen(PORT, () => {
  console.log(`Videos Stream Service on port ${PORT}`);
});
