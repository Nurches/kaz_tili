import React from "react";
import "./LoadingSpinner.css";

const LoadingSpinner: React.FC = () => {
  return (
    <div className="loading-spinner-container">
      <div className="spinner-wrapper">
        <div className="spinner-background"></div>
        <div className="spinner-foreground"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
