import React, { useEffect, useState } from 'react';
import './match.css';
import { matchingAPI, chatAPI } from '../../Services/api'; // Import chatAPI too
import Navbar from "../navigation/bottom-navbar"

//const CURRENT_USER_ID = 'user1'; // Use actual logged-in user
const currentUserProfile = JSON.parse(localStorage.getItem("currentUserProfile") || "{}")
const CURRENT_USER_ID = currentUserProfile.userId

export default function MatchingPage() {
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processedIds, setProcessedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('processedMatches');
      return new Set(saved ? JSON.parse(saved) : []);
    } catch (e) {
      return new Set();
    }
  });
  const [swipeClass, setSwipeClass] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const SWIPE_ANIM_MS = 320;

  // Filter unprocessed profiles for display
  const unprocessedProfiles = profiles.filter(p => !processedIds.has(p.matchId));

  // Load profiles on mount
  useEffect(() => {
    const loadProfiles = async () => {
      setLoading(true);
      try {
        const matches = await matchingAPI.getPendingMatches(CURRENT_USER_ID);
        setProfiles(matches);
      } catch (err) {
        console.error('Failed to load profiles', err);
        setError('Failed to load profiles');
      } finally {
        setLoading(false);
      }
    };
    loadProfiles();
  }, []);

  // Reset index when unprocessed profiles change
  useEffect(() => {
    setCurrentIndex(0);
  }, [unprocessedProfiles.length]);

  // Save processed ID to localStorage
  useEffect(() => {
    localStorage.setItem('processedMatches', JSON.stringify([...processedIds]));
  }, [processedIds]);

  const handleAccept = async () => {
    if (!unprocessedProfiles[currentIndex]) return;

    const currentProfile = unprocessedProfiles[currentIndex];
    
    try {
      setIsAnimating(true);
      
      // Check if match was already processed
      if (processedIds.has(currentProfile.matchId)) {
        alert("This match has already been processed");
        return;
      }

      // Get current user info (you should replace this with your actual user data)
      const currentUserInfo = {
        userId: CURRENT_USER_ID,
        pseudonym: "You", // Replace with actual user pseudonym
        avatar: "" // Replace with actual user avatar
      };

      // Optimistically mark as processed
      setProcessedIds(prev => new Set([...prev, currentProfile.matchId]));

      try {
        // Accept the match via API
        const acceptRes = await matchingAPI.acceptMatch(currentProfile.matchId, CURRENT_USER_ID);

        let finalChat = null;

        if (acceptRes && acceptRes.chat) {
          // Server returned a chat
          finalChat = acceptRes.chat;
        } else {
          // Server didn't return a chat - create one
          try {
            finalChat = await chatAPI.createChat(
              currentUserInfo,
              {
                userId: currentProfile.userId,
                pseudonym: currentProfile.pseudonym,
                avatar: currentProfile.avatar
              }
            );
          } catch (createErr) {
            // Rollback optimistic changes if createChat fails
            setProcessedIds(prev => {
              const copy = new Set(prev);
              copy.delete(currentProfile.matchId);
              return copy;
            });
            setError('Failed to create chat');
            console.error('createChat failed:', createErr);
            alert('Match accepted but failed to create chat. Please try again.');
            return;
          }
        }

        console.log('Chat created successfully:', finalChat);
        alert(`You matched with ${currentProfile.pseudonym}! You can now chat with them.`);

      } catch (apiErr) {
        // Rollback optimistic updates if accept endpoint failed
        setProcessedIds(prev => {
          const copy = new Set(prev);
          copy.delete(currentProfile.matchId);
          return copy;
        });
        setError('Failed to accept match');
        console.error('acceptMatch failed:', apiErr);
        alert('Failed to accept match. Please try again.');
        return;
      }

      // Move to next profile only after successful acceptance
      moveToNext();

    } catch (err) {
      console.error('Error in handleAccept:', err);
      setError('Failed to process match');
      setIsAnimating(false);
    }
  };

  const handleReject = async () => {
    if (!unprocessedProfiles[currentIndex]) return;

    const currentProfile = unprocessedProfiles[currentIndex];
    
    try {
      setIsAnimating(true);
      
      // Check if match was already processed
      if (processedIds.has(currentProfile.matchId)) {
        alert("This match has already been processed");
        return;
      }

      // Optimistically mark as processed
      setProcessedIds(prev => new Set([...prev, currentProfile.matchId]));

      try {
        await matchingAPI.rejectMatch(currentProfile.matchId, CURRENT_USER_ID);
        alert(`You rejected ${currentProfile.pseudonym}`);
      } catch (apiErr) {
        // Rollback
        setProcessedIds(prev => {
          const copy = new Set(prev);
          copy.delete(currentProfile.matchId);
          return copy;
        });
        setError('Failed to reject match');
        console.error('rejectMatch failed:', apiErr);
        alert('Failed to reject match. Please try again.');
        return;
      }

      // Move to next profile only after successful rejection
      moveToNext();

    } catch (err) {
      console.error('Error in handleReject:', err);
      setError('Failed to process match');
      setIsAnimating(false);
    }
  };

  const handleSwipe = (direction = 'left') => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSwipeClass(`swipe-${direction}`);
    setTimeout(() => {
      setSwipeClass('');
      setIsAnimating(false);
      moveToNext();
    }, SWIPE_ANIM_MS);
  };

  const handleBack = () => {
    if (isAnimating) return;
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const moveToNext = () => {
    setCurrentIndex(prev => {
      if (prev + 1 >= unprocessedProfiles.length) {
        return prev;
      }
      return prev + 1;
    });
    setIsAnimating(false);
  };

  const currentProfile = unprocessedProfiles[currentIndex];

  if (loading) {
    return <div className="profiles-page"><p>Loading profiles...</p></div>;
  }

  if (error) {
    return <div className="profiles-page"><p className="error">{error}</p></div>;
  }

  if (unprocessedProfiles.length === 0) {
    return (
      <div className="profiles-page">
        <div className="no-profiles">
          <h2>No more profiles!</h2>
          <p>You've reviewed all available matches. Check back later for new profiles.</p>
        </div>
        <Navbar />
      </div>
    );
  }

  return (
    <div className="profiles-page">
      <div className="profiles-container">
        <h1>Profiles</h1>

        {/* Profile Card */}
        <div className={`profile-card ${swipeClass}`}>
          {/* Avatar Section */}
          <div className="profile-avatar">
            {currentProfile.avatar ? (
              <img src={currentProfile.avatar} alt={currentProfile.pseudonym} />
            ) : (
              <div className="avatar-placeholder">
                {currentProfile.pseudonym.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="profile-info">
            <h2 className="pseudonym">{currentProfile.pseudonym}</h2>
            
            <p className="bio">{currentProfile.about}</p>

            {/* Interest Tags */}
            <div className="interests">
              {currentProfile.interests && currentProfile.interests.map(interest => (
                <span key={interest} className="interest-tag">
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="actions">
            <button className="back-btn" onClick={handleBack} disabled={isAnimating || currentIndex === 0} aria-label="Back">
              Back
            </button>
            <button className="reject-btn" onClick={handleReject} disabled={isAnimating}>
              Reject
            </button>
            <button className="accept-btn" onClick={handleAccept} disabled={isAnimating}>
              Accept
            </button>
          </div>
          <div className="action-swipe">
            <button className="swipe-btn" onClick={() => handleSwipe('left')} disabled={isAnimating} aria-label="Swipe">
              Click to swipe
            </button>
          </div>

          {/* Swipe Hint 
          <p className="swipe-hint">Swipe or click buttons</p>*/}
          {/* Progress */}
          <div className="progress">
            Profile {currentIndex + 1} of {unprocessedProfiles.length}
          </div>
        </div>
      </div>

      <Navbar />
    </div>
  );
}