import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { auth } from '../../firebase'; 
import { doc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth'; 
import "./login.css";

const VerificationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { uid, generatedCode, anonymousID } = location.state || {};
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!uid || !generatedCode || !anonymousID) {
    navigate('/');
    return null;
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (code !== generatedCode) {
      setError('Invalid verification code!');
      setLoading(false);
      return;
    }

    try {
      // LOGS for debugging
      console.log("Original UID from email:", uid);
      console.log("Using Anonymous ID from LoginPage:", anonymousID);
      console.log("Saving to localStorage now...");

      // APPLICATION BOX: Create user profile with anonymous ID only
      await setDoc(doc(db, "Users", anonymousID), {
        nickname: "User" + anonymousID.slice(0, 7),
        verifiedAt: new Date(),
        joinDate: new Date(),
        lastActive: new Date(),
      });

      // Store anonymous ID locally with consistent key name
      localStorage.setItem('currentAnonymousId', anonymousID);

      // Store UID for returning users - ADD THIS
      localStorage.setItem('userUid', uid);

      console.log("Verification successful! User data saved.");

      console.log("Firebase Auth signed out for privacy");
      console.log("User now completely anonymous in app");

      alert("Verification successful! You are now anonymous. Redirecting...");

      navigate('/create-profile');
    } catch (err) {
      console.error("Verification error:", err);
      setError('Error saving user data. Please try again.');
    } finally {
      setLoading(false);
    }
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

        <h1 className="login-title">Enter Verification Code</h1>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleVerifyCode}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Enter verification code"
              value={code}
              onChange={e => setCode(e.target.value)}
              required
              className="form-input"
              maxLength="6"
            />
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerificationPage;