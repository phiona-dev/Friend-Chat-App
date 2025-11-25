import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { userAPI } from '../../Services/api';

export default function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const userId = localStorage.getItem('currentUserId');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!userId) {
      navigate('/welcome', { replace: true });
      return;
    }

    // Verify that a server-side profile exists for this userId and cache it
    (async () => {
      try {
        const profile = await userAPI.getProfile(userId);
        // Cache profile in localStorage so profile page and other UI can read it
        try {
          localStorage.setItem('currentUserProfile', JSON.stringify(profile));
        } catch (e) {
          console.warn('ProtectedRoute: failed saving profile to localStorage', e);
        }
        setChecking(false);
      } catch (err) {
        console.warn('ProtectedRoute: profile check failed', err);
        // If API returned 404 (profile not found) redirect to create-profile
        const msg = String(err?.message || '').toLowerCase();
        if (msg.includes('404') || msg.includes('not found')) {
          navigate('/create-profile', { replace: true });
        } else {
          // Non-404 errors: allow access but stop checking
          setChecking(false);
        }
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (checking) return <div style={{padding:'2rem',textAlign:'center'}}>Checking profile…</div>;

  return children;
}
