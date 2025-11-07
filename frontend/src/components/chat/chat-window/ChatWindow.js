//Individual chat interface
import React, { useRef, useEffect, useState } from 'react';
import Message from "../message/Message";
import "./ChatWindow.css";

const ChatWindow = ({ currentChat, currentUser, onBack, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  //auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [currentChat?.messages])

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage(""); //clear input after sending
    }
  }

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

      {/* messages container */}
      <div className="messages-container">
        {currentChat.messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet</p>
            <span>Start the conversation by sending a message!</span>
          </div>
        ) : (
          currentChat.messages.map(message => (
            <Message
              key={message.messageId}
              message={message}
              isOwn={message.senderId === currentUser.userId}
            />
          ))
        )}
        {/*invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/*message input */}
      <form className="message-input-form" onSubmit={handleSendMessage}>
        <div className="input-container">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="message-input"
          />
          <button
            type="submit"
            className="send-button"
            disabled={!newMessage.trim()}
          >
            Send
            </button>
        </div>
      </form>
    </div>
  )
  
}

export default ChatWindow