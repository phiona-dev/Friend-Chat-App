import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./welcomepage.css"

const WelcomePage = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect logged-in users to home
    const userId = localStorage.getItem('currentUserId');
    if (userId) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleGetStarted = () => {
    navigate('/login', { state: { mode: 'signup' } });
  };

  const handleLoginInstead = () => {
    navigate('/quick-login');
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
        
        <div className="welcome-actions">
          <button 
            className="get-started-btn"
            onClick={handleGetStarted}
          >
            Get Started
          </button>
          <button 
            className="login-instead-btn"
            onClick={handleLoginInstead}
          >
            Already have a profile? Log in instead
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;