import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './LostFoundDetail.css'; // Import the CSS file
import Skeleton from '../common/Skeleton';
import { chatAPI } from '../../Services/api'; // Adjust path as needed

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';

export default function LostFoundDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contactLoading, setContactLoading] = useState(false);

  const currentUserProfile = JSON.parse(localStorage.getItem('currentUserProfile') || '{}');
  const currentUser = {
    userId: currentUserProfile.userId || 'user1',
    pseudonym: currentUserProfile.pseudonym || 'You',
    avatar: currentUserProfile.avatar || '/avatars/user1.jpg'
  };

  // Status colors for dynamic styling
  const statusColors = {
    lost: { bg: '#fef2f2', text: '#991b1b', border: '#fca5a5' },
    found: { bg: '#f0fdf4', text: '#166534', border: '#86efac' },
    claimed: { bg: '#f3f4f6', text: '#4b5563', border: '#d1d5db' }
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/lostfound/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load');
        setItem(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleContactReporter = async () => {
  if (!currentUser.userId) {
    alert('Please log in to contact the reporter');
    navigate('/login');
    return;
  }
  if (!item || !item.reporterId) {
    alert('Unable to contact reporter - missing information');
    return;
  }
  if (currentUser.userId === item.reporterId) {
    alert("This is your own post!");
    return;
  }

  setContactLoading(true);
  try {
    console.log('Fetching user chats using chatAPI...');
    
    // Use your existing chatAPI service instead of direct fetch
    const userChats = await chatAPI.getUserChats(currentUser.userId);
    console.log('User chats:', userChats);

    const existingChat = userChats.find(chat => 
      chat.participants.some(p => p.userId === item.reporterId)
    );

    console.log('Existing chat found:', existingChat);

    if (existingChat) {
      console.log('Navigating to existing chat:', existingChat._id);
      navigate(`/chats?chatId=${existingChat._id}`);
    } else {
      console.log('Creating new chat...');
      const newChat = await chatAPI.createChat(
        {
          userId: currentUser.userId,
          pseudonym: currentUser.pseudonym,
          avatar: currentUser.avatar
        },
        {
          userId: item.reporterId,
          pseudonym: item.reporterName || 'Reporter',
          avatar: item.reporterAvatar || '/avatars/default.jpg'
        }
      );
      
      console.log('New chat created:', newChat);
      
      if (newChat._id || newChat.chatId) {
        const chatId = newChat._id || newChat.chatId;
        navigate(`/chats?chatId=${chatId}`);
      } else {
        navigate('/chats');
      }
    }
  } catch (error) {
    console.error('Contact error details:', error);
    alert('Failed to start conversation. Please try again.');
  } finally {
    setContactLoading(false);
  }
  };

  async function updateStatus(newStatus) {
    try {
      const res = await fetch(`${API_BASE}/lostfound/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update');
      setItem(data);
    } catch (e) {
      alert(e.message);
    }
  }

  // Loading State
  if (loading) return (
    <div className="loading-container">
      <div style={{ width: '100%', maxWidth: 900 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Skeleton circle width={56} height={56} />
          <div style={{ flex: 1 }}>
            <Skeleton width="70%" height={18} />
            <div style={{ height: 8 }} />
            <Skeleton width="45%" height={14} />
          </div>
        </div>
        <div style={{ marginTop: 18 }}>
          <Skeleton rows={8} height={12} />
        </div>
      </div>
    </div>
  );
  
  // Error State
  if (error) return (
    <div className="error-container">
      <div className="error-content">
        <div className="error-icon">⚠️</div>
        <h3 className="error-title">Error Loading Item</h3>
        <p className="error-message">{error}</p>
        <button className="back-button" onClick={() => navigate(-1)}>← Go Back</button>
      </div>
    </div>
  );
  
  // Not Found State
  if (!item) return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="not-found-icon">🔍</div>
        <h3 className="not-found-title">Item Not Found</h3>
        <p className="not-found-message">This item may have been removed or doesn't exist.</p>
        <button className="back-button" onClick={() => navigate(-1)}>← Go Back</button>
      </div>
    </div>
  );

  const colors = statusColors[item.status] || statusColors.claimed;

  console.log('=== DEBUG INFO ===');
  console.log('Item reporterId:', item.reporterId);
  console.log('Current user ID:', currentUser.userId);
  console.log('User profile from localStorage:', localStorage.getItem('currentUserProfile'));
  console.log('Are IDs equal?', currentUser.userId === item.reporterId);
  console.log('==================');

  return (
    <div className="lost-found-detail">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back to List
      </button>

      <div className="detail-container">
        {item.imageUrl && (
          <div className="item-image-container">
            <img 
              src={`${API_BASE.replace('/api', '')}${item.imageUrl}`}
              alt={item.title}
              className="item-image"
              onError={(e) => {
                console.error('Image failed to load:', e.target.src);
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        <div className="detail-content">
          <div className="badges-container">
            <span 
              className="status-badge"
              style={{
                background: colors.bg,
                color: colors.text,
                border: `2px solid ${colors.border}`
              }}
            >
              {item.status.toUpperCase()}
            </span>
            <span className="category-badge">
              {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
            </span>
            {item.location && (
              <span className="location-badge">
                📍 {item.location}
              </span>
            )}
          </div>

          <h1 className="item-title">{item.title}</h1>
          <p className="item-description">{item.description}</p>

          {(item.reporterName || item.reporterId) && (
            <div className="reporter-section">
              <h4 className="reporter-header">Reported By</h4>
              <div className="reporter-info">
                <div className="reporter-details">
                  {item.reporterName && <div className="reporter-name">{item.reporterName}</div>}
                  {item.reporterEmail && <div className="reporter-email">{item.reporterEmail}</div>}
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.5rem' }}>
                    Reporter ID: {item.reporterId || 'Not available'}
                  </div>
                </div>
                <button
                  className={`contact-button ${contactLoading ? 'loading' : ''}`}
                  onClick={handleContactReporter}
                  disabled={contactLoading || currentUser.userId === item.reporterId}
                >
                  {contactLoading ? 'Starting Chat...' : 
                   currentUser.userId === item.reporterId ? 'Your Post' : 'Contact Me'}
                </button>
              </div>
            </div>
          )}

          <div className="status-section">
            <h4 className="status-header">Update Status</h4>
            <div className="status-buttons">
              {['lost','found','claimed'].map(status => {
                const btnColors = statusColors[status];
                const isActive = item.status === status;
                return (
                  <button
                    key={status}
                    className="status-button"
                    disabled={isActive}
                    onClick={() => updateStatus(status)}
                    style={{
                      background: isActive ? btnColors.bg : 'white',
                      color: isActive ? btnColors.text : 'var(--gray-700)',
                      border: `2px solid ${isActive ? btnColors.border : 'var(--gray-300)'}`,
                    }}
                  >
                    {isActive && '✓ '}
                    Mark as {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}