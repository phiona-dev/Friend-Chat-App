// src/components/Navigation/BottomNav.js
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import "./bottom-navbar.css";
import { 
  faHeart, 
  faEdit, 
  faSearch, 
  faComments, 
  faUser 
} from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      id: 'matching',
      label: 'Matching',
      icon: faHeart,
      path: '/matching'
    },
    {
      id: 'posts',
      label: 'Posts',
      icon: faEdit,
      path: '/posts'
    },
    {
      id: 'lost-found',
      label: 'Lost & Found',
      icon: faSearch,
      path: '/lost-found'
    },
    {
      id: 'chat',
      label: 'Chats',
      icon: faComments,
      path: '/chats'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: faUser,
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
            <FontAwesomeIcon icon={item.icon} className="nav-icon" />
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;