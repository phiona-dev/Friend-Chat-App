// LoginPage.jsx - CORRECTED VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./login.css";
import { auth } from '../../firebase';
import { db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import emailjs from '@emailjs/browser';
import { v4 as uuidv4 } from 'uuid';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  //const [, setUserId] = useState("");

  //strong password regex
  const isStrongPassword = (password) => {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return strongPasswordRegex.test(password);
  }
  
  //Custom error messages
  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/email-already-in-use":
        return "Email already registered";
      case "auth/invalid-email":
        return "Invalid email address or format";
      case "auth/weak-password":
        return "Password should be at least 6 characters!";
      default:
        return `Unexpected error: ${errorCode}`;
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    //Strong password check
    if (!isStrongPassword(password)) {
      setError('Password must be at least 6 characters long and include uppercase, lowercase, number, and special character.');
      setLoading(false);
      return;
    }

    // Check if it's a USIU email
    if (!email.includes('@usiu.ac.ke')) {
      setError('Please use your USIU email address');
      setLoading(false);
      return;
    }
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Generate anonymous ID immediately
      const anonymousID = uuidv4();

      // VERIFICATION BOX: Store the connection securely (one-time)
      await setDoc(doc(db, "VerificationBox", uid), {
        anonymousID: anonymousID, 
        email: email, // This is the ONLY place email is stored
        verifiedAt: new Date(),
        // Admin controls for accountability
        adminAccessLog: [],
        lastAdminAccess: null
      });

      // Generate 6-digit code
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Calculate expiry time for email
      const expiryMinutes = 3;
      const expiresAt = new Date(Date.now() + expiryMinutes * 60000);
      const expiryTimeFormatted = expiresAt.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit'
      });

      // Save code in VerificationBox
      await setDoc(doc(db, "VerificationCodes", uid), {
        code: newCode,
        createdAt: new Date(),
        expiresAt: expiresAt
      });

      // Send code via email
      await emailjs.send(
        "service_5wdkx74",
        "template_f7nvm99",
        { 
          to_email: email, 
          passcode: newCode,
          time: expiryTimeFormatted,
          expiry_time: `${expiryMinutes} minutes`,
        },
        "ohkQhougF79J5H3ER"
      );

      // Store anonymous ID locally
      localStorage.setItem('currentAnonymousId', anonymousID);
      
      // Proceed to verification step - FIXED: pass anonymousID
      navigate('/verify', {
        state: { 
          uid, 
          generatedCode: newCode,
          anonymousID: anonymousID 
        } 
      });

      alert("Verification code sent to your email!");
    } catch (error) {
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkExistingUser = () => {
      const anonymousID = localStorage.getItem('currentAnonymousId');
      
      if (anonymousID) {
        console.log("Found existing user in localStorage, redirecting to welcome back");
        navigate('/welcome-back');
      }
    };

    checkExistingUser();
  }, [navigate]);

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
        
        <form onSubmit={handleSignIn}>
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
      </div>
    </div>
  );
};

export default LoginPage;