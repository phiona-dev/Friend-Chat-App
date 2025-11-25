// WelcomeBackPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { db } from '../../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import "./login.css";

const WelcomeBackPage = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [uid, setUid] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkReturningUser = async () => {
      const anonymousID = localStorage.getItem('currentAnonymousId');
      
      if (!anonymousID) {
        console.log("No anonymousID found, redirecting to login");
        navigate('/');
        return;
      }

      try {
        // APPLICATION BOX: Get user data using anonymous ID only
        const userDoc = await getDoc(doc(db, "Users", anonymousID));
        if (!userDoc.exists()) {
          console.log("No user data found, redirecting to login");
          navigate('/');
          return;
        }

        const userData = userDoc.data();
        setUsername(userData.nickname || 'User');
        console.log("Found returning user:", userData.nickname);

        // VERIFICATION BOX: Find the email by querying with anonymousID
        console.log("Querying VerificationBox for email...");
        const verificationQuery = query(
          collection(db, "VerificationBox"), 
          where("anonymousID", "==", anonymousID)
        );
        
        const querySnapshot = await getDocs(verificationQuery);
        if (!querySnapshot.empty) {
          const verificationData = querySnapshot.docs[0].data();
          const verificationUid = querySnapshot.docs[0].id;
          setUserEmail(verificationData.email);
          setUid(verificationUid); // Store UID for later use
          console.log("Found email in VerificationBox:", verificationData.email);
        } else {
          console.log("No verification data found");
          setError('Unable to retrieve user information. Please sign in again.');
        }
        
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError('Error loading user data. Please sign in again.');
      }
    };

    checkReturningUser();
  }, [navigate]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!password) {
      setError('Please enter your password');
      setLoading(false);
      return;
    }

    if (!userEmail || !uid) {
      setError('User session expired. Please sign in again.');
      setLoading(false);
      return;
    }

    try {
      // Step 1: Verify credentials with Firebase Auth
      console.log("Attempting to sign in with email from VerificationBox:", userEmail);
      const userCredential = await signInWithEmailAndPassword(auth, userEmail, password);
      const authUid = userCredential.user.uid;
      console.log("Successfully authenticated, UID:", authUid);

      // Verify UID matches what we found in VerificationBox
      if (authUid !== uid) {
        setError('Authentication mismatch. Please sign in again.');
        await auth.signOut();
        setLoading(false);
        return;
      }

      // Step 2: Get anonymous ID from Verification Box (again for verification)
      const verificationDoc = await getDoc(doc(db, "VerificationBox", uid));
      
      if (!verificationDoc.exists()) {
        setError('User verification not found. Please sign up again.');
        await auth.signOut();
        setLoading(false);
        return;
      }

      const verificationData = verificationDoc.data();
      const anonymousID = verificationData.anonymousID;
      console.log("Retrieved anonymousID from VerificationBox:", anonymousID);

      // Step 3: Sign out of Firebase Auth to maintain anonymity
      await auth.signOut();
      console.log("Signed out of Firebase Auth for privacy");

      // Step 4: Ensure anonymous ID is stored and proceed
      localStorage.setItem('currentAnonymousId', anonymousID);
      
      alert(`Welcome back, ${username}!`);
      navigate('/chats');
      
    } catch (error) {
      console.error("Sign in error:", error);
      setError(getErrorMessage(error.code));
      // Ensure we're signed out on error
      try { await auth.signOut(); } catch (e) {}
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/user-not-found":
        return "No account found. Please sign up again.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later.";
      default:
        return `Sign in failed: ${errorCode}`;
    }
  };

  

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-container">
          <img src="/logo.png" alt="Friend Chat App Logo" className="app-logo" />
        </div>
        
        <h1 className="login-title">Welcome back! </h1>
        <p className="welcome-message">
          We're glad to see you again. Please enter your password to continue.
        </p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSignIn}>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="form-input"
            />
          </div>
          
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing In...' : 'Continue Anonymously'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WelcomeBackPage;