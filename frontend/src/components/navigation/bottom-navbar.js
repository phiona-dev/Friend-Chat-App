// src/components/Navigation/BottomNav.js
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import "./bottom-navbar.css"

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      id: 'matching',
      label: 'Matching',
      icon: '💕',
      path: '/matching'
    },
    {
      id: 'posts',
      label: 'Posts',
      icon: '📝',
      path: '/posts'
    },
    {
      id: 'lost-found',
      label: 'Lost & Found',
      icon: '🔍',
      path: '/lost-found'
    },
    {
      id: 'chat',
      label: 'Chats',
      icon: '💬',
      path: '/chats'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: '👤',
      path: '/profile'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-container">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${location.pathname === item.path ? 'nav-item-active' : ''}`}
            onClick={() => handleNavigation(item.path)}
            aria-label={item.label}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;