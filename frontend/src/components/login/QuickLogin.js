import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';
import { auth, db } from '../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const QuickLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) { setError('Enter email and password'); return; }
    if (!normalizedEmail.includes('@')) { setError('Enter a valid email'); return; }
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      const uid = cred?.user?.uid;
      if (uid) {
        try {
          const snap = await getDoc(doc(db, 'UserMap', uid));
          if (snap.exists()) {
            const { anonymousID } = snap.data() || {};
            if (anonymousID) {
              localStorage.setItem('currentUserId', anonymousID);
            } else {
              localStorage.setItem('currentUserId', uid);
            }
          } else {
            localStorage.setItem('currentUserId', uid);
          }
        } catch (mapErr) {
          localStorage.setItem('currentUserId', uid);
        }
      }
      navigate('/');
    } catch (err) {
      if (err.code === 'auth/wrong-password') {
        setError('Incorrect password');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found for this email. Try signing up.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Try again later.');
      } else {
        setError('Login failed');
      }
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
        <h1 className="login-title">Log In</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@domain.com"
              className="form-input"
              disabled={loading}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="form-input"
              disabled={loading}
              required
              minLength={6}
            />
          </div>
          <button type="submit" className="login-btn" disabled={loading}>{loading ? 'Logging in...' : 'Log In'}</button>
        </form>
        <button
          type="button"
          style={{ marginTop: '1rem', background: 'transparent', color: 'var(--accent)', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          onClick={() => navigate('/login')}
        >Need to create an account?</button>
        <button
          type="button"
          style={{ marginTop: '0.5rem', background: 'transparent', color: 'var(--text-dim)', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
          onClick={() => navigate('/welcome')}
        >Back to welcome</button>
      </div>
    </div>
  );
};

export default QuickLogin;
