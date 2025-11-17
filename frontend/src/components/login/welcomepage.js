import React from 'react';
import { useNavigate } from 'react-router-dom';
import "./welcomepage.css"

const WelcomePage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div className="welcome-container">
      <div className="welcome-card">
        {/* Logo from public folder */}
        <div className="logo-container">
          <img 
            src="/logo.png" // Direct path from public folder
            alt="Friend Chat App Logo" 
            className="app-logo"
          />
        </div>
        
        <h1 className="app-title">Friend Chat App</h1>
        
        <p className="app-description">
          Your anonymous gateway to connecting with fellow USIU students
        </p>
        
        <button 
          className="get-started-btn"
          onClick={handleGetStarted}
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default WelcomePage;