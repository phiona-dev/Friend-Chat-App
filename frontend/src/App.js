// src/App.js
import React from 'react';
import ChatPage from './pages/ChatPage';
import './App.css';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import LostFoundList from './pages/lostfound/LostFoundList';
import LostFoundForm from './pages/lostfound/LostFoundForm';
import LostFoundDetail from './pages/lostfound/LostFoundDetail';

/*function NavBar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');
  
  return (
    <nav style={{
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      padding: '1rem 2rem',
      boxShadow: 'var(--shadow-md)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderBottom: '1px solid rgba(99, 102, 241, 0.1)'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link to="/" style={{
          fontSize: '1.375rem',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginRight: 'auto'
        }}>
          Friend Chat
        </Link>
        <Link to="/lostfound" style={{
          padding: '0.5rem 1rem',
          borderRadius: 'var(--radius)',
          fontWeight: 600,
          background: isActive('/lostfound') && !location.pathname.includes('/new') ? 'var(--primary)' : 'transparent',
          color: isActive('/lostfound') && !location.pathname.includes('/new') ? 'white' : 'var(--gray-700)'
        }}>
          Lost & Found
        </Link>
        <Link to="/lostfound/new" style={{
          padding: '0.5rem 1.25rem',
          borderRadius: 'var(--radius)',
          fontWeight: 600,
          background: isActive('/lostfound/new') ? 'var(--primary)' : 'var(--primary-light)',
          color: 'white',
          boxShadow: 'var(--shadow-sm)'
        }}>
          + Report Item
        </Link>
      </div>
    </nav>
  );
}*/

/*function HomePage() {
  return (
    <div style={{
      maxWidth: '800px',
      margin: '3rem auto',
      padding: '2rem',
      background: 'white',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-xl)'
    }}>
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: 700,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '1rem'
      }}>
        Welcome to Friend Chat
      </h1>
      <p style={{ fontSize: '1.125rem', color: 'var(--gray-600)', lineHeight: 1.7 }}>
        A social platform built for USIU-A students to reduce social anxiety, form meaningful connections, and create a safer digital community.
      </p>
      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        background: 'var(--gray-50)',
        borderRadius: 'var(--radius)',
        borderLeft: '4px solid var(--primary)'
      }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--gray-800)', marginBottom: '0.75rem' }}>
          🔍 Lost & Found Module
        </h3>
        <p style={{ color: 'var(--gray-600)', lineHeight: 1.6, margin: 0 }}>
          Report and track lost items on campus. Quickly match items with their owners and reduce the hassle of searching across multiple channels.
        </p>
      </div>
    </div>
  );
}*/

function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh' }}>
        {/*<NavBar />*/}
        <Routes>
          {/*<Route path="/" element={<HomePage />} />*/}
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/lost-found" element={<LostFoundList />} />
          <Route path="/lostfound/new" element={<LostFoundForm />} />
          <Route path="/lostfound/:id" element={<LostFoundDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
  
