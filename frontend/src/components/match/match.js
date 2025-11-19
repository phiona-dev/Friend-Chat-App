import React, { useEffect, useState } from 'react';
import './match.css';
import { matchingAPI } from '../../Services/api';
import Navbar from "../navigation/bottom-navbar"

const CURRENT_USER_ID = 'user1'; // Use actual logged-in user

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
  const SWIPE_ANIM_MS = 320; // duration must match CSS transition

  // Load profiles on mount
  useEffect(() => {
    const loadProfiles = async () => {
      setLoading(true);
      try {
        const matches = await matchingAPI.getPendingMatches(CURRENT_USER_ID);
        // Filter out already processed matches
        const filtered = matches.filter(m => !processedIds.has(m.matchId));
        setProfiles(filtered);
      } catch (err) {
        console.error('Failed to load profiles', err);
        setError('Failed to load profiles');
      } finally {
        setLoading(false);
      }
    };
    loadProfiles();
  }, [processedIds]);

  // Save processed ID to localStorage
  useEffect(() => {
    localStorage.setItem('processedMatches', JSON.stringify([...processedIds]));
  }, [processedIds]);

  const handleAccept = () => {
    const currentProfile = profiles[currentIndex];
    if (!currentProfile) return;

    // Mark as processed
    setProcessedIds(prev => new Set([...prev, currentProfile.matchId]));
    
    // Move to next profile
    moveToNext();
  };

  const handleReject = () => {
    const currentProfile = profiles[currentIndex];
    if (!currentProfile) return;

    // Mark as processed
    setProcessedIds(prev => new Set([...prev, currentProfile.matchId]));
    
    // Move to next profile
    moveToNext();
  };

  // Swipe handler: animates then moves to next without marking processed
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

  // Navigate back to previous profile
  const handleBack = () => {
    if (isAnimating) return;
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const moveToNext = () => {
    setCurrentIndex(prev => prev + 1);
  };

  if (loading) {
    return <div className="profiles-page"><p>Loading profiles...</p></div>;
  }

  if (error) {
    return <div className="profiles-page"><p className="error">{error}</p></div>;
  }

  if (profiles.length === 0 || currentIndex >= profiles.length) {
    return (
      <div className="profiles-page">
        <div className="no-profiles">
          <h2>No more profiles!</h2>
          <p>You've reviewed all available matches. Check back later for new profiles.</p>
          <button className="back-btn" onClick={handleBack} disabled={isAnimating || currentIndex === 0} aria-label="Back">
              Back
          </button>
        </div>
        <Navbar />
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];

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
            <button className="swipe-btn" onClick={() => handleSwipe('left')} disabled={isAnimating} aria-label="Swipe">
              Swiping
            </button>
            <button className="accept-btn" onClick={handleAccept} disabled={isAnimating}>
              Accept
            </button>
          </div>

          {/* Swipe Hint */}
          <p className="swipe-hint">Swipe or click buttons</p>
        </div>

        {/* Progress */}
        <div className="progress">
          Profile {currentIndex + 1} of {profiles.length}
        </div>
      </div>

      <Navbar />
    </div>
  );
}