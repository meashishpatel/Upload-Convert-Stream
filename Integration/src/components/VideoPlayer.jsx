import { useRef, useState, useEffect } from "react";
import "./player.css";

const VideoPlayer = ({ videoId }) => {
  const videoRef = useRef(null);
  const [currentResolution, setCurrentResolution] = useState("720p"); // Default resolution

  // Function to adjust the video resolution based on the selected quality
  const changeResolution = (resolution) => {
    setCurrentResolution(resolution); // Update the resolution state
  };

  // Function to estimate network speed and adjust the video resolution accordingly
  const adjustResolutionBasedOnNetwork = () => {
    if (navigator.connection) {
      const { effectiveType } = navigator.connection;

      // Use network type to adjust resolution
      if (effectiveType === "4g") {
        setCurrentResolution("1080p");
      } else if (effectiveType === "3g") {
        setCurrentResolution("720p");
      } else if (effectiveType === "2g") {
        setCurrentResolution("480p");
      } else {
        setCurrentResolution("240p");
      }
    }
  };

  useEffect(() => {
    adjustResolutionBasedOnNetwork(); // Adjust video resolution based on network speed

    if (videoRef.current) {
      const videoElement = videoRef.current;

      videoElement.pause();
      videoElement.src = `http://localhost:5500/videos/${videoId}/${currentResolution}.mp4`; // Use dynamic resolution
      videoElement.load();

      const handleLoadedData = () => {
        videoElement.play().catch((error) => {
          console.error("Failed to play video:", error);
        });
      };

      videoElement.addEventListener("loadeddata", handleLoadedData);

      return () => {
        videoElement.removeEventListener("loadeddata", handleLoadedData);
      };
    }
  }, [videoId, currentResolution]); // Run whenever videoId or currentResolution changes

  return (
    <div className="video-player-container">
      <h3>Playing Video: {videoId}</h3>

      {/* Quality selection buttons */}
      <div className="quality-selector">
        <button onClick={() => changeResolution("240p")}>240p</button>
        <button onClick={() => changeResolution("480p")}>480p</button>
        <button onClick={() => changeResolution("720p")}>720p</button>
        <button onClick={() => changeResolution("1080p")}>1080p</button>
      </div>

      {/* Display current resolution */}
      <div className="current-resolution">
        <span>Current Quality: {currentResolution}</span>
      </div>

      {/* Video element */}
      <video
        key={currentResolution} // Force video re-render when resolution changes
        ref={videoRef}
        width="640"
        height="360"
        controls
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
