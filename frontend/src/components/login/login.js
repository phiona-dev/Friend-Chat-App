// LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';
import '../create-profile/createProfile.css';
import { auth, db } from '../../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, fetchSignInMethodsForEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import emailjs from '@emailjs/browser';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pseudonym, setPseudonym] = useState('');
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [returningUser, setReturningUser] = useState(false);
  const [storedPseudonym, setStoredPseudonym] = useState('');
  const [step, setStep] = useState(0); // 0=email, 1=password+pseudonym+interests
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const profileStr = localStorage.getItem('currentUserProfile');
      const loginMetaStr = localStorage.getItem('loginMeta');
      if (profileStr && loginMetaStr) {
        const profile = JSON.parse(profileStr);
        const loginMeta = JSON.parse(loginMetaStr);
        if (loginMeta.email) {
          setEmail(loginMeta.email);
          setStoredPseudonym(profile.pseudonym || 'Friend');
          setReturningUser(true);
        }
      }
    } catch (e) {
      // ignore parse errors
    }
  }, []);

  const isStrongPassword = (pwd) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(pwd);

  const getErrorMessage = (code) => {
    switch (code) {
      case 'auth/email-already-in-use': return 'Email already registered';
      case 'auth/invalid-email': return 'Invalid email format';
      case 'auth/weak-password': return 'Weak password';
      default: return `Unexpected error: ${code}`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (returningUser) {
      if (!password) {
        setError('Enter password');
        setLoading(false);
        return;
      }
    } else {
      // New user flow
      if (step === 0) {
        // should not submit from step 0 (uses Next button)
        setLoading(false);
        return;
      }
      if (!email || !password || !pseudonym) {
        setError('Fill all required fields');
        setLoading(false);
        return;
      }
      if (!email.includes('@usiu.ac.ke')) {
        setError('Use your USIU email');
        setLoading(false);
        return;
      }
      if (!isStrongPassword(password)) {
        setError('Password must include upper, lower, number & special char (min 6).');
        setLoading(false);
        return;
      }
      if (interests.length === 0) {
        setError('Select at least one interest');
        setLoading(false);
        return;
      }
    }

    if (returningUser) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const uid = cred?.user?.uid;
        try {
          if (uid) {
            const snap = await getDoc(doc(db, 'UserMap', uid));
            if (snap.exists()) {
              const { anonymousID } = snap.data() || {};
              if (anonymousID) {
                localStorage.setItem('currentUserId', anonymousID);
              }
            } else {
              // Fallback: allow access but mark with uid
              localStorage.setItem('currentUserId', uid);
            }
          }
        } catch (mapErr) {
          // Allow navigation even if map lookup fails
          if (uid) localStorage.setItem('currentUserId', uid);
        }
        navigate('/');
        return;
      } catch (err) {
        setError('Incorrect password.');
        setLoading(false);
        return;
      }
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      localStorage.setItem('loginMeta', JSON.stringify({ email }));
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiryMinutes = 15;
      const expiresAt = new Date(Date.now() + expiryMinutes * 60000);
      const expiryTimeFormatted = expiresAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      await emailjs.send(
        'service_5wdkx74',
        'template_f7nvm99',
        { to_email: email, passcode: newCode, time: expiryTimeFormatted, expiry_time: `${expiryMinutes} minutes` },
        'ohkQhougF79J5H3ER'
      );

      // store profile info to finalize after verification
      const pendingProfile = { pseudonym: pseudonym.trim(), interests };
      localStorage.setItem('pendingProfile', JSON.stringify(pendingProfile));

      navigate('/verify', { state: { uid: cred.user.uid, generatedCode: newCode } });
      alert('Verification code sent to your email!');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        localStorage.setItem('loginMeta', JSON.stringify({ email }));
        setReturningUser(true);
        setError('Email already registered. Please sign in.');
      } else {
        setError(getErrorMessage(err.code));
      }
    } finally {
      setLoading(false);
    }
  };

  const INTERESTS = [
    'Art & Design','Coding & Tech','Sports','Gaming','Music','Literature','Science','Business','Volunteering','Photography','Travel','Food & Cooking','Fashion','Film & TV','Debate','Entrepreneurship'
  ];

  const toggleInterest = (interest) => {
    setInterests(prev => prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]);
  };

  const handleEmailNext = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Enter email'); return; }
    if (!email.includes('@usiu.ac.ke')) { setError('Must be a USIU email'); return; }
    try {
      setLoading(true);
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods && methods.length > 0) {
        localStorage.setItem('loginMeta', JSON.stringify({ email }));
        setReturningUser(true);
        setStep(0);
        setError('Email already registered. Please enter your password.');
      } else {
        setStep(1);
      }
    } catch (checkErr) {
      console.warn('Failed to check sign-in methods', checkErr);
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-container">
          <img src="/logo.png" alt="Friend Chat App Logo" className="app-logo" />
        </div>
        <h1 className="login-title">
          {returningUser ? `Welcome back, ${storedPseudonym || email}` : step === 0 ? 'Get Started' : 'Create Account'}
        </h1>
        {returningUser && (
          <p style={{ textAlign: 'center', marginTop: '-0.75rem', color: '#6b7280' }}>
            {`Account detected for ${storedPseudonym || email}. Enter your password to continue.`}
          </p>
        )}
        {!returningUser && step === 0 && <p style={{ textAlign: 'center', marginTop: '-0.75rem', color: '#6b7280' }}>Enter your USIU email to begin.</p>}
        {error && <div className="error-message">{error}</div>}

        {returningUser ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Password"
                minLength={6}
                className="form-input"
                disabled={loading}
              />
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Signing In...' : 'Continue'}
            </button>
            <button
              type="button"
              style={{ marginTop: '1rem', background: 'transparent', color: '#6366f1', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => {
                localStorage.removeItem('loginMeta');
                setReturningUser(false);
                setStoredPseudonym('');
                setPassword('');
                setStep(0);
              }}
            >Not you?</button>
          </form>
        ) : step === 0 ? (
          <form onSubmit={handleEmailNext}>
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
                disabled={loading}
              />
            </div>
            <button type="submit" className="login-btn" disabled={loading || !email}>Next</button>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="password">Choose a Strong Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Password"
                minLength={6}
                className="form-input"
                disabled={loading}
              />
              <small style={{color:'#6b7280'}}>Must include upper, lower, number & special char.</small>
            </div>
            <div className="form-group">
              <label htmlFor="pseudonym">Choose Your Pseudonym</label>
              <input
                type="text"
                id="pseudonym"
                value={pseudonym}
                onChange={(e) => setPseudonym(e.target.value)}
                required
                placeholder="e.g. StarGazer"
                className="form-input"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Interests (pick some)</label>
              <div className="interests-list">
                {INTERESTS.map(int => (
                  <button
                    type="button"
                    key={int}
                    className={`interest-btn ${interests.includes(int) ? 'selected' : ''}`}
                    onClick={() => toggleInterest(int)}
                    disabled={loading}
                  >{int}</button>
                ))}
              </div>
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Registering...' : 'Create Account'}
            </button>
            <button
              type="button"
              style={{ marginTop: '0.75rem', background: 'transparent', color: '#6366f1', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => setStep(0)}
            >Back</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;