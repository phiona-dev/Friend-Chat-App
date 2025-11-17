//List of all conversations
import React from 'react';
import "./ChatList.css";
import Navbar from '../../navigation/bottom-navbar';

const ChatList = ({
  chats,
  pendingMatches,
  onSelectChat,
  onAcceptMatch,
  onRejectMatch,
  currentUser
}) => {
  return (
    <div className="chat-list">
    {/* header */}
      <div className="chat-list-header">
          <h2>Messages</h2>
      </div>

      {/*pending matches section */}
      {pendingMatches && pendingMatches.length > 0 && (
        <div className="pending-matches-section">
          <div className="section-label">
            <span>New Match Requests</span>
          </div>
          <div className="pending-matches-list">
            {pendingMatches.map(match => (
              <PendingMatchCard 
                key={match.matchId}
                match={match}
                onAccept={() => onAcceptMatch(match)}
                onReject={() => onRejectMatch(match)}
              />
            ))}
          </div>
        </div>
      )}

      {/*chat conversations (accepted matches) */}
      <div className="chats-container">
        <div className="chats-section-label">
          <span>Your Conversations</span>
        </div>

        {chats.length === 0 ? (
          <div className="no-chats">
            <p>No conversations yet</p>
            <span>Accept some matches to start chatting!</span>
          </div>
        ) : (
          chats.map(chat => (
            <ChatListItem
              key={chat.chatId}
              chat={chat}
              currentUser={currentUser}
              onSelect={onSelectChat}
            />
          ))
        )}
      </div>
    </div>
  )
}

//pending match card component
const PendingMatchCard = ({ match, onAccept, onReject }) => {
  return (
    <div className="pending-match-card">
      <div className="match-profile-info">
        <div className="match-avatar">
          <img
            src={match.avatar}
            alt={match.pseudonym}
            onError={(e) => {
              //if image fails to load
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
          <div className="avatar-fallback">
            {match.pseudonym.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="match-details">
          <h4 className="match-name">{match.pseudonym}</h4>
          <div className="match-interests">
            {match.interests.slice(0, 3).map((interest, index) => (
              <span key={index} className="interest-tag">#{interest}</span>
            ))}
            {match.interests.length > 3 && (
              <span className="more-interests">+{match.interests.length - 3} more</span>
            )}
          </div>
          {match.bio && (
            <p className="match-bio">{match.bio}</p>
          )}
        </div>
      </div>

      <div className="match-actions">
        <button
          className="reject-button"
          onClick={onReject}
          aria-label="Reject match"
        >
          X
        </button>
        <button
          className="accept-button"
          onClick={onAccept}
          aria-label="Accept match"
        >
          ✓
        </button>
      </div>
    </div>
  )
}

// chatlist item component (for accepted matches)
const ChatListItem = ({ chat, currentUser, onSelect }) => {
  const otherUser = chat.participants.find(p => p.userId !== currentUser.userId);

  const messages = chat.messages || [];
  // prefer an explicit messages array (loaded when opening a chat),
  // otherwise fall back to chat.lastMessage populated by the server
  const lastMessage = (messages && messages.length) ? messages[messages.length - 1] : (chat.lastMessage || null);

  return (
    <div className="chat-list-item" onClick={() => onSelect(chat)}>
      <div className="user-avatar">
        <div className="avatar-placeholder">
          {otherUser.pseudonym.charAt(0).toUpperCase()}
        </div>
        {otherUser.isOnline && <div className="online-indicator"></div>}
      </div>

      <div className="chat-info">
        <div className="user-info">
          <h3 className="username">{otherUser.pseudonym}</h3>
          <span className="timestamp">
            {lastMessage ? formatTime(lastMessage.timestamp || lastMessage.timestamp) : ""}
          </span>
        </div>

        <div className="message-preview">
          <p className="last-message">
            {lastMessage && lastMessage.content ? lastMessage.content : "Start a conversation..."}
          </p>
          {chat.unreadCount > 0 && (
            <span className="unread-badge">{chat.unreadCount}</span>
          )}
        </div>
      </div>
      <Navbar/>
    </div>
  )
}

//helper function
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = (now - date) / (1000 * 60);

  if (diffInMinutes < 1) return "Now";
  if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return date.toLocaleDateString()
}
export default ChatList