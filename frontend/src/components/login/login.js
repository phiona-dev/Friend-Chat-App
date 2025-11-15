// LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./login.css";

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    // Check if it's a USIU email
    if (!email.includes('@usiu.ac.ke')) {
      setError('Please use your USIU email address');
      setLoading(false);
      return;
    }

    // Simulate login process
    setTimeout(() => {
      setLoading(false);
      // For now, just navigate to welcome page
      // Later you can add actual authentication here
      navigate('/welcome');
    }, 1500);
  };

  const handleForgotPassword = () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }
    alert(`Password reset instructions will be sent to: ${email}`);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Logo */}
        <div className="logo-container">
          <img 
            src="/logo.png" 
            alt="Friend Chat App Logo" 
            className="app-logo"
          />
        </div>
        
        <h1 className="login-title">Sign in to Friend Chat App</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">USIU Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your.name@usiu.ac.ke"
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              minLength="6"
              className="form-input"
            />
          </div>
          
          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Login'}
          </button>
        </form>
        
        <div className="forgot-password">
          <button 
            type="button" 
            className="forgot-password-btn"
            onClick={handleForgotPassword}
          >
            Forgot Password?
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;