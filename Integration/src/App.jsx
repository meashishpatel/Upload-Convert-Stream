import "./App.css";
import React, { useState, useEffect } from "react";
import VideoPlayer from "./Components/VideoPlayer";
import axios from "axios";
import ProgressBar from "./components/ProgressBar";

function App() {
  const [videoList, setVideoList] = useState([]);
  const [videoId, setVideoId] = useState(null);

  // API call for dynamic mapping
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch("http://localhost:5500/videos");
        const data = await response.json();
        setVideoList(data);
      } catch (error) {
        console.error("Failed to fetch", error);
      }
    };

    fetchVideos();
  }, []);

  const playVideo = (e, videoId) => {
    e.preventDefault();
    setVideoId(videoId);
  };

  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState(0);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showProgressBar, setShowProgressBar] = useState(true);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
    setCurrentFileIndex(0);
    setProgress(0);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      window.alert("Please select a file first");
      return;
    }

    setIsUploading(true);
    setShowProgressBar(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setCurrentFileIndex(i);
        setProgress(0);

        const formData = new FormData();
        formData.append("file", file);

        await axios.post("http://localhost:5000/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percent);
          },
        });

        setProgress(100);
      }

      setTimeout(() => {
        window.alert("All files uploaded successfully");
      }, 1000);
    } catch (err) {
      window.alert("Error uploading files");
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setShowProgressBar(false);
      }, 3000);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Video Streaming & File Uploader</h1>
      </header>
      <div className="content-container">
        <div className="video-section">
          <h2>Available Videos</h2>
          {videoId && <VideoPlayer videoId={videoId} />}
          <div className="video-list">
            {videoList.map((video) => (
              <button
                key={video.name}
                className="video-button"
                onClick={(e) => playVideo(e, video.name)}
              >
                {video.name}
              </button>
            ))}
          </div>
        </div>
        <div className="upload-section">
          <h2>Upload Your Files</h2>
          <div className="upload-card">
            <form onSubmit={handleUpload}>
              <input
                type="file"
                className="file-input"
                onChange={handleFileChange}
                multiple
              />
              <button
                type="submit"
                className="upload-button"
                disabled={isUploading}
              >
                {isUploading ? "Processing..." : "Upload"}
              </button>
            </form>
            {showProgressBar &&
              files.length > 0 &&
              currentFileIndex < files.length && (
                <div>
                  <p>{files[currentFileIndex].name}</p>
                  <ProgressBar progress={progress} />
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
