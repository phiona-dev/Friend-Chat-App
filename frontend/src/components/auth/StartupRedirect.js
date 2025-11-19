// StartupRedirect.js
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { userAPI } from '../../Services/api';

export default function StartupRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't run redirect logic if we're already on any of the main app pages
    const mainAppPaths = [
      '/chats', '/matching', '/profile', '/lost-found', 
      '/lostfound/new', '/lostfound/:id', '/create-profile'
    ];
    
    // Check if current path matches any main app path
    const isOnMainAppPath = mainAppPaths.some(path => {
      if (path.includes('/:')) {
        // Handle dynamic routes like '/lostfound/:id'
        const basePath = path.split('/:')[0];
        return location.pathname.startsWith(basePath);
      }
      return location.pathname === path;
    });

    if (isOnMainAppPath) {
      return; // Already where we want to be, no redirect needed
    }

    const profileStr = localStorage.getItem('currentUserProfile');
    if (profileStr) {
      // User has completed profile -> allow free navigation to any page
      // Since they're not on a main app page, redirect to a default page (e.g., profile)
      navigate('/chats', { replace: true });
      return;
    }

    const userId = localStorage.getItem('currentUserId');
    if (userId) {
      // User has started authentication but hasn't completed profile -> continue to create-profile
      navigate('/create-profile', { replace: true });
      return;
    }

    // No authentication started -> start from login
    navigate('/login', { replace: true });
  }, [navigate, location.pathname]);

  return null;
}