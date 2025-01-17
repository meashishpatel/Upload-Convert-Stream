import React from "react";

const ProgressBar = ({ progress }) => {
  return (
    <div>
      <div className="progress">
        <div
          className="progress-bar progress-bar progress-bar-animated"
          role="progressbar"
          style={{ width: `${progress}%` }}
          aria-valuenow={progress}
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
