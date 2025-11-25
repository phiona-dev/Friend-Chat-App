import React, { useEffect, useState } from 'react';
import './RightSidebar.css';
import { matchingAPI } from '../../Services/api';
import { useNavigate } from 'react-router-dom';

export default function RightSidebar() {
  const profile = JSON.parse(localStorage.getItem('currentUserProfile') || '{}');
  const userId = profile.userId;
  const [matches, setMatches] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const res = await matchingAPI.getPendingMatches(userId);
        setMatches(Array.isArray(res) ? res.slice(0, 4) : []);
      } catch (e) {
        setMatches([]);
      }
    })();
  }, [userId]);

  // TODO: wire this to a real "latest lost items" endpoint
  useEffect(() => {
    setLostItems([]);
  }, []);

  const handleOpenMatch = async (match) => {
    try {
      if (!match.matchId || !userId) return;
      await matchingAPI.acceptMatch(match.matchId, userId);
      navigate('/chats');
    } catch (e) {
      console.error('Failed to open match chat', e);
    }
  };

  return (
    <div className="right-sidebar-root">
      <section className="rs-section">
        <button
          className="rs-report-btn"
          type="button"
          onClick={() => navigate('/lostfound/new')}
        >
          + Report lost item
        </button>
      </section>

      <section className="rs-section rs-profile">
        <div className="rs-profile-row">
          <div className="rs-avatar" aria-hidden="true">{(profile.pseudonym || 'You')[0]?.toUpperCase?.() || 'U'}</div>
          <div className="rs-profile-text">
            <div className="rs-pseudonym">{profile.pseudonym || 'You'}</div>
            <div className="rs-sub">{profile.about || 'Welcome back to FriendChat 👋'}</div>
          </div>
        </div>
      </section>

      <section className="rs-section">
        <div className="rs-section-header">
          <span>Suggested matches</span>
        </div>
        {matches.length === 0 ? (
          <div className="rs-empty">No matches yet. Update interests to discover people.</div>
        ) : (
          <ul className="rs-list">
            {matches.map(m => (
              <li
                key={m.matchId || m.userId}
                className="rs-item rs-item-clickable"
                onClick={() => handleOpenMatch(m)}
              >
                <div className="rs-avatar small" aria-hidden="true">{(m.pseudonym || 'Anon')[0]?.toUpperCase?.() || 'A'}</div>
                <div className="rs-item-main">
                  <div className="rs-item-title">{m.pseudonym || 'Anon'}</div>
                  {m.interests && m.interests.length > 0 && (
                    <div className="rs-item-sub">{m.interests.slice(0, 3).join(' • ')}</div>
                  )}
                </div>
                {typeof m.similarityScore === 'number' && (
                  <div className="rs-pill">{Math.round(m.similarityScore)}%</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rs-section">
        <div className="rs-section-header">
          <span>Latest lost items</span>
        </div>
        {lostItems.length === 0 ? (
          <div className="rs-empty">Nothing recent. You seem all caught up.</div>
        ) : (
          <ul className="rs-list">
            {lostItems.map(item => (
              <li key={item._id} className="rs-item">
                <div className="rs-item-main">
                  <div className="rs-item-title">{item.title || item.category || 'Lost item'}</div>
                  <div className="rs-item-sub">{item.location || item.description}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
