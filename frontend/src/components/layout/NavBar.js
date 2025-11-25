import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './NavBar.css';
import { getAuth, signOut } from 'firebase/auth';

const links = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/chats', label: 'Chats', icon: '💬' },
  { to: '/matching', label: 'Matching', icon: '🤝' },
  { to: '/lost-found', label: 'Lost & Found', icon: '📦' },
  { to: '/profile', label: 'Profile', icon: '👤' },
];

export default function NavBar({ variant = 'top' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const profile = JSON.parse(localStorage.getItem('currentUserProfile') || '{}');

  useEffect(() => {
    const saved = localStorage.getItem('appTheme');
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved);
      document.documentElement.dataset.theme = saved;
    } else {
      document.documentElement.dataset.theme = 'dark';
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem('appTheme', next);
  };

  const handleSignOut = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      localStorage.removeItem('currentUserId');
      localStorage.removeItem('currentUserProfile');
      localStorage.removeItem('loginMeta');
      localStorage.removeItem('pendingProfile');
      navigate('/welcome', { replace: true });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Don't show navbar on welcome/login/verify pages
  if (location.pathname === '/welcome' || location.pathname === '/login' || location.pathname === '/verify') {
    return null;
  }

  if (variant === 'sidebar') {
    return (
      <nav className="sidebar-nav">
        <ul className="sidebar-nav-list">
          {links.map(l => (
            <li key={l.to}>
              <Link
                to={l.to}
                className={
                  'sidebar-nav-item ' + (location.pathname === l.to ? 'active' : '')
                }
              >
                <span className="sidebar-icon" aria-hidden="true">{l.icon}</span>
                <span className="sidebar-label">{l.label}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="sidebar-bottom-actions">
          <button className="sidebar-circle-btn" title="Create">
            ＋
          </button>
          <button className="sidebar-circle-btn" title="Notifications">
            🔔
          </button>
          <button className="sidebar-circle-btn" title="Profile" onClick={() => navigate('/profile')}>
            👤
          </button>
        </div>
      </nav>
    );
  }

  return (
    <header className="app-navbar">
      <div className="nav-inner">
        <div className="brand">
          <Link to="/" className="brand-link">
            <img src="/logo.png" alt="Logo" className="brand-logo" />
            <span className="brand-text">FriendChat</span>
          </Link>
        </div>
        <nav className={"nav-links " + (open ? 'open' : '')}>
          {/* Top bar minimal: only create, notifications, profile live in actions now */}
        </nav>
        <div className="actions">
          <button className="top-icon-btn top-create" title="Create post" onClick={() => navigate('/') }>
            <span className="top-icon">＋</span>
            <span className="top-label">Create</span>
          </button>
          <button className="top-icon-btn" title="Notifications">
            🔔
          </button>
          <button onClick={toggleTheme} className="theme-toggle theme-text" aria-label="toggle theme">
            Theme
          </button>
          <button onClick={handleSignOut} className="sign-out-btn" title="Sign Out">
            🚪
          </button>
          <button className="top-profile-btn" title="Profile" onClick={() => navigate('/profile')}>
            <div className="top-profile-avatar" aria-hidden="true">
              {(profile.pseudonym || 'You')[0]?.toUpperCase?.() || 'U'}
            </div>
          </button>
          <button className="hamburger" onClick={() => setOpen(o => !o)} aria-label="menu">
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  );
}