import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../Services/api';

export default function StartupRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      try {
        const profileStr = localStorage.getItem('currentUserProfile');
        if (profileStr) {
          navigate('/chats', { replace: true });
          return;
        }

        const userId = localStorage.getItem('currentUserId');
        if (!userId) {
          navigate('/login', { replace: true });
          return;
        }

        // Check backend if profile exists for this userId
        try {
          const res = await userAPI.getProfile(userId);
          if (res && res.userId) {
            // cache profile locally for faster startup next time
            const profileObj = { userId: res.userId, pseudonym: res.pseudonym, interests: res.interests || [] };
            localStorage.setItem('currentUserProfile', JSON.stringify(profileObj));
            navigate('/chats', { replace: true });
          } else {
            navigate('/create-profile', { replace: true });
          }
        } catch (err) {
          // If backend check fails, go to login to be safe
          console.error('Startup profile check failed:', err);
          navigate('/login', { replace: true });
        }
      } catch (err) {
        console.error('Startup redirect error', err);
        navigate('/login', { replace: true });
      }
    };

    run();
  }, [navigate]);

  return null;
}
