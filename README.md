## Overview
This project is designed with a multi-service architecture consisting of **four server-side scripts**. These scripts are responsible for handling frontend and backend services, enabling features like video uploading, and video streaming.

### Services Overview
1. **Frontend Services**:
   - **Port 3000**: handles video uploads.
   - **Port 3500**: Handles video streaming on the frontend.

2. **Backend Microservices**:
   - **Upload Microservice (Port 5000)**:
     - Handles single or multiple `.mp4` video uploads.
     - Saves videos to a backend-specific path.
     - Converts uploaded videos into different resolutions using `FFmpeg`.
   - **Stream Microservice (Port 5500)**:
     - `/videos`: Returns unique video file names available in the backend for frontend mapping.
     - `/videos/:folder/:quality.mp4`: Streams specific video files to the video player on the frontend.

### Independence of Microservices
Both backend microservices are designed to be **independent** and can be integrated into other applications without modifications.

---

## Setup Instructions

### Prerequisites
1. Install **FFmpeg**:
   - Use the provided `ffmpeg.7z` file in the project folder.
   - Extract it to `C:\ffmpeg`.
   - Add the path `C:\ffmpeg\bin` to your system's environment variables.

2. Install **PM2** (optional but recommended):
   - PM2 ensures the services continue running in the background.
   - Install it using `npm install -g pm2`.

---

### Running the Application
To run the entire setup, execute the following scripts from the main project folder:

1. **Frontend Scripts**:
   - `uploads-app.js`: Runs the frontend service on port 3000 for user login.
   - `stream-app.js`: Runs the frontend service on port 3500 for video streaming.

2. **Backend Scripts**:
   - `uploads.js`: Runs the upload microservice on port 5000.
   - `stream.js`: Runs the streaming microservice on port 5500.
  
```bash
node uploads.js
node uploads-app.js
node stream.js
node stream-app.js
```

### Using PM2 (Optional)
Start the services using PM2 for persistent background processes:
```bash
pm2 start uploads.js
pm2 start uploads-app.js
pm2 start stream.js
pm2 start stream-app.js
```

---

## Key Features

### Upload Microservice
- Accepts single or multiple `.mp4` files.
- Converts videos to multiple resolutions using FFmpeg.

### Stream Microservice
- Provides a list of available video files.
- Streams videos dynamically based on folder and quality parameters.

---

## Notes
- Ensure FFmpeg is correctly installed and the environment variable is set before starting the services.
- The project architecture supports modularity, allowing the backend microservices to be repurposed in other applications. 

---

This document serves as a concise guide to understanding, setting up, and running the project.
