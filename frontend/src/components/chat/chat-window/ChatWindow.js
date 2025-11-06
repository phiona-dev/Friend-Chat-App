//Individual chat interface
import React from 'react';
import "./ChatWindow.css";

const ChatWindow = ({ currentChat, currentUser, onBack }) => {
  //if no chat is selected, show a placeholder
  if (!currentChat) {
    return (
      <div className="chat-window no-chat-selected">
        <div className="no-chat-message">
          <h3>Select a conversation</h3>
          <p>Choose a chat from the list to start messaging</p>
        </div>
      </div>
    )
  }

  //Find the other user in the chat (not the current user)
  const otherUser = currentChat.participants.find(
    participant => participant.userId !== currentUser.userId
  )

  return (
    <div className="chat-window">
      {/*Chat header */}
      <div className="chat-header">
        <button className="back-button" onClick={onBack}>
        ←
        </button>
        <div className="chat-partner-info">
          <div className="partner-avatar">
            {otherUser.pseudonym.charAt(0).toUpperCase()}
            {otherUser.isOnline && <div className="online-dot"></div>}
          </div>
          <div className="partner-details">
            <h3>{otherUser.pseudonym}</h3>
            <span className="partner-status">
              {otherUser.isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      </div>

      {/*messages and input added later */}
      <div className="messages-container">
        <p style={{padding: "20px", textAlign: "center", color: "#666"}}>
          Messages will appear here
        </p>
      </div>
    </div>
  )
  
}

export default ChatWindow