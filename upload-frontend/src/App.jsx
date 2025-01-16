import React, { useState } from "react";
import axios from "axios";
import ProgressBar from "./components/ProgressBar";

function App() {
  // req var
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState(0);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false); 
  const [showProgressBar, setShowProgressBar] = useState(true); 

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
    setCurrentFileIndex(0); // index of filess
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
        setCurrentFileIndex(i);  // upload  one by one files
        setProgress(0); 

        const formData = new FormData();
        formData.append("file", file);

        await axios.post("http://localhost:5000/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percent);
          },
        });

        setProgress(100);
      }

      // Show sys alert after all files are uploaded
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
    <div className="bg-light vh-100 d-flex justify-content-center align-items-center">
      <div className="card shadow-lg p-4" style={{ width: "400px" }}>
        <h2 className="text-center mb-4 text-primary">File Uploader</h2>
        <form className="mb-2" onSubmit={handleUpload}>
          <div className="mb-3">
            <input type="file" className="form-control" onChange={handleFileChange} multiple />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary w-100" 
            disabled={isUploading}>
            {isUploading ? 'processing...' : 'Upload'}
          </button>
        </form>

        {showProgressBar && files.length > 0 && currentFileIndex < files.length && (
          <div>
            <p className="mt-1 mb-0 pb-0">{files[currentFileIndex].name}</p>
            <ProgressBar progress={progress} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
