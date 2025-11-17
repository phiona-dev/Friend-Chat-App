// LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./login.css";
import {auth} from '../../firebase';
import { db } from '../../firebase';
import {doc, setDoc} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import emailjs from '@emailjs/browser';


const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');;
  const navigate = useNavigate();
  const [, setUserId] = useState("");


  
  //Custom error messages
    const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/email-already-in-use":
        return "Email alrady regestered";
      case "auth/invalid-email":
        return "Invalid email address or formart";
      case "auth/weak-password":
        return "Password should be at least 6 characters!";
      default:
        return `Unexpected error: ${errorCode}`;
    }
  };


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
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      setUserId(uid);

      // Generate 6-digit code
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      console.log("Generated code:", newCode);

      //save code in Firestore
      await setDoc(doc(db, "VerificationCodes", uid), {
        code: newCode,
        createdAt: new Date(),
      });

      // Send code via email
      await emailjs.send(
        "service_5wdkx74",
        "template_f7nvm99",
        { to_email: email, passcode: newCode },
        "ohkQhougF79J5H3ER"
      );

      // Proceed to verification step
      navigate('/verify', {state: { uid, generatedCode : newCode} });
  
    alert("Verification code sent to your email!");
    } catch (error) {
      setError(getErrorMessage(error.code));
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
      </div>
    </div>
  );
};

export default LoginPage;