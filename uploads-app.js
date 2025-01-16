const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "upload-frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "upload-frontend/dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`React app is running on http://localhost:${PORT}`);
});