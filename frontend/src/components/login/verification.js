// VerificationPage.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { userAPI } from '../../Services/api';
import "./login.css";

const VerificationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { uid, generatedCode } = location.state || {};
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  

  if (!uid || !generatedCode) {
    navigate('/');
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
      const anonymousID = uuidv4();

      
      // persist the anonymous id locally so returning users are detected
      localStorage.setItem('currentUserId', anonymousID);

      await setDoc(doc(db, "UserMap", uid), {
        anonymousID,
        createdAt: new Date(),
      });

      await setDoc(doc(db, "Users", anonymousID), {
        nickname: "User" + anonymousID.slice(0, 7),
        verifiedAt: new Date(),
      });

      // If we collected profile earlier, finalize it now
      const pendingProfileStr = localStorage.getItem('pendingProfile');
      if (pendingProfileStr) {
        try {
          const pendingProfile = JSON.parse(pendingProfileStr);
          const profilePayload = {
            userId: anonymousID,
            pseudonym: pendingProfile.pseudonym,
            interests: pendingProfile.interests,
          };
          await userAPI.createProfile(profilePayload);
          localStorage.setItem('currentUserProfile', JSON.stringify(profilePayload));
          localStorage.removeItem('pendingProfile');
          alert('Verification successful! Profile created.');
          navigate('/chats');
          return;
        } catch (profileErr) {
          // Fallback to manual profile creation page
          alert('Verified, but failed to auto-create profile. Please complete manually.');
          navigate('/create-profile');
          return;
        }
      }

      alert('Verification successful! Complete your profile.');
      navigate('/create-profile');
    } catch (err) {
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
