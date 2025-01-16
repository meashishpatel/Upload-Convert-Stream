import "./App.css";
import { useState, useEffect } from "react";
import VideoPlayer from "./Components/VideoPlayer";

function App() {
  const [videoList, setVideoList] = useState([]);
  const [videoId, setVideoId] = useState(null);

  // api call for dynamic maping
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch("http://localhost:5500/videos");
        const data = await response.json();
        setVideoList(data);
      } catch (error) {
        console.error("failed to fetch", error);
      }
    };

    fetchVideos();
  }, []);

  const playVideo = (e, videoId) => {
    e.preventDefault();
    setVideoId(videoId);
  };

  return (
    <div className="app-container">
      <h2 className="app-title">Video Streaming App</h2>
      {videoId && <VideoPlayer videoId={videoId} />}
      <div className="button-container">
        {videoList.map((video) => (
          <button
            key={video.name}
            className="play-button"
            onClick={(e) => playVideo(e, video.name)}
          >
            {video.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
