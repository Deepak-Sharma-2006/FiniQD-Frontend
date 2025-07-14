// src/assets/LoadingSpinner.jsx
import React from 'react';
import './LoadingSpinner.css'; // CSS for spinner

const LoadingSpinner = () => {
    return (
        <div className="spinner-backdrop">
            <div className="spinner" />
        </div>
    );
};

export default LoadingSpinner;
