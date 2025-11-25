import React, { useEffect, useState } from 'react';
import './match.css';
import { matchingAPI } from '../../Services/api';
import { useNavigate } from 'react-router-dom';

// Resolve current user id from saved profile (same as RightSidebar)
const storedProfile = JSON.parse(localStorage.getItem('currentUserProfile') || '{}');
const CURRENT_USER_ID = storedProfile.userId;

export default function MatchingPage() {
  const [matches, setMatches] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [swipeClass, setSwipeClass] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!CURRENT_USER_ID) {
      setError('Please create your profile first so we can match you.');
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await matchingAPI.getPendingMatches(CURRENT_USER_ID);
        if (cancelled) return;
        setMatches(Array.isArray(res) ? res : []);
      } catch (e) {
        if (cancelled) return;
        console.error('Failed to load matches', e);
        setError('Failed to load matches. Please try again later.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const handleAccept = async (match) => {
    if (!match || isAnimating) return;
    try {
      await matchingAPI.acceptMatch(match.matchId, CURRENT_USER_ID);
      setMatches(prev => prev.filter(m => m.matchId !== match.matchId));
      setIndex(0);
      navigate('/chats');
    } catch (e) {
      console.error('Failed to accept match', e);
      setError('Failed to accept match. Please try again.');
    }
  };

  const handleSkip = async (match) => {
    if (!match || isAnimating) return;
    try {
      await matchingAPI.rejectMatch(match.matchId, CURRENT_USER_ID);
    } catch (e) {
      console.warn('Failed to send reject to server, ignoring', e);
    }
    setMatches(prev => prev.filter(m => m.matchId !== match.matchId));
    setIndex((prev) => (prev >= matches.length - 1 ? 0 : prev));
  };

  const handleSwipe = (direction = 'left') => {
    if (isAnimating || !matches[index]) return;
    setIsAnimating(true);
    setSwipeClass(direction === 'right' ? 'swipe-right' : 'swipe-left');
    setTimeout(() => {
      setSwipeClass('');
      setIsAnimating(false);
      // Treat a swipe as a skip by default
      handleSkip(matches[index]);
    }, 320);
  };

  if (loading) {
    return (
      <div className="profiles-page">
        <p>Loading matches...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profiles-page">
        <p className="error">{error}</p>
        {String(error).toLowerCase().includes('profile') && (
          <div style={{ marginTop: '1rem' }}>
            <a href="/create-profile" className="login-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
              Create Profile
            </a>
          </div>
        )}
      </div>
    );
  }

  if (!matches.length) {
    return (
      <div className="profiles-page">
        <div className="no-profiles">
          <h2>No matches yet</h2>
          <p>Try updating your interests or bio on your profile to help us find better matches.</p>
          <button className="btn-base" onClick={() => navigate('/profile')}>
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profiles-page">
      <div className="profiles-container">
        <h1>Suggested Match</h1>
        <p className="text-dim" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
          Swipe through one profile at a time.
        </p>
        {matches[index] && (
          <div className={`profile-card ${swipeClass}`}>
            <div className="profile-avatar">
              {matches[index].avatar ? (
                <img src={matches[index].avatar} alt={matches[index].pseudonym || 'Match avatar'} />
              ) : (
                <div className="avatar-placeholder">
                  {(matches[index].pseudonym || 'Anon').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="profile-info">
              <div className="match-header-row">
                <h2 className="pseudonym">{matches[index].pseudonym || 'Anon'}</h2>
                {typeof matches[index].similarityScore === 'number' && (
                  <span className="similarity-pill">{Math.round(matches[index].similarityScore)}% match</span>
                )}
              </div>
              <p className="bio">{matches[index].about || 'No bio yet.'}</p>
              {matches[index].interests && matches[index].interests.length > 0 && (
                <div className="interests">
                  {matches[index].interests.slice(0, 6).map(interest => (
                    <span key={interest} className="interest-tag">
                      {interest}
                    </span>
                  ))}
                </div>
              )}
              <div className="actions">
                <button
                  className="back-btn"
                  onClick={() => setIndex((prev) => (prev > 0 ? prev - 1 : 0))}
                  disabled={isAnimating || index === 0}
                >
                  Back
                </button>
                <button
                  className="reject-btn"
                  onClick={() => handleSkip(matches[index])}
                  disabled={isAnimating}
                >
                  Reject
                </button>
                <button
                  className="accept-btn"
                  onClick={() => handleAccept(matches[index])}
                  disabled={isAnimating}
                >
                  Accept
                </button>
              </div>
              <div className="action-swipe">
                <button
                  className="swipe-btn"
                  onClick={() => handleSwipe('left')}
                  disabled={isAnimating}
                >
                  Swipe
                </button>
              </div>

              <div className="progress">
                Profile {index + 1} of {matches.length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}