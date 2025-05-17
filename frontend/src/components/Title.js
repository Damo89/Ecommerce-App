import React from 'react';
import '../styles/Title.css';

const Title = () => {
  return (
    <div className="title-wrapper">
      <div className="brand-icon">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="#0a84ff" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="title-icon"
        >
          <path d="M5 13a10 10 0 0 1 14 0" />
          <path d="M8.5 16.5a5 5 0 0 1 7 0" />
          <path d="M12 20h.01" />
        </svg>
      </div>
      <h1 className="brand-name">
        <span className="brand-main">Fake</span>
        <span className="brand-accent">Tech</span>
        <span className="brand-main">Direct</span>
      </h1>
      <p className="brand-tagline">Your gateway to premium gear</p>
    </div>
  );
};

export default Title;