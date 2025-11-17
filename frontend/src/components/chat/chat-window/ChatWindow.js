// Individual chat interface
import React, { useRef, useEffect, useState } from 'react';
import Message from "../message/Message";
import "./ChatWindow.css";

const ChatWindow = ({ 
  currentChat, 
  currentUser, 
  onBack, 
  onSendMessage,
  onTypingStart,
  onTypingStop,
  typingUsers = [],
  onlineUsers = []
}) => {
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [optimisticMessages, setOptimisticMessages] = useState([])
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Auto-scroll to bottom when messages change - FIXED: use currentChat.messages directly
  useEffect(() => {
    scrollToBottom()
  }, [currentChat?.messages?.length]) // Only depend on length to avoid infinite loops

  // Handle typing indicators - FIXED: Simplified to prevent loops
  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    // Handle typing start
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      onTypingStart?.();
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onTypingStop?.();
      }
    }, 1000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Stop typing when component unmounts
      if (isTyping) {
        onTypingStop?.();
      }
    };
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const messageContent = newMessage.trim();
      
      // Stop typing when sending
      if (isTyping) {
        setIsTyping(false);
        onTypingStop?.();
      }

      // Create optimistic message
      const optimisticMessage = {
        _id: `optimistic-${Date.now()}`,
        messageId: `optimistic-${Date.now()}`,
        chatId: currentChat.chatId || currentChat._id,
        senderId: currentUser.userId,
        content: messageContent,
        timestamp: new Date(),
        isOptimistic: true
      };

      // Add to optimistic messages for immediate UI update
      setOptimisticMessages(prev => [...prev, optimisticMessage]);
      setNewMessage("");

      try {
        await onSendMessage(messageContent);
        
        // Keep optimistic message; it will be replaced when real message arrives via socket
        // or on next chat reload
        
      } catch (error) {
        // If sending fails, remove the optimistic message
        setOptimisticMessages(prev => 
          prev.filter(msg => msg._id !== optimisticMessage._id)
        );
        alert("Failed to send message");
      }
    }
  }

  // Check if other user is online
  const otherUser = currentChat?.participants?.find(
    participant => participant.userId !== currentUser.userId
  )

  const isOtherUserOnline = onlineUsers.includes(otherUser?.userId)

  // Get typing users for this chat (excluding current user)
  const chatTypingUsers = typingUsers.filter(userId => userId !== currentUser.userId)

  // Combine real messages with optimistic messages
  const allMessages = [...(currentChat?.messages || []), ...optimisticMessages]

  // If no chat is selected, show a placeholder
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

  return (
    <div className="chat-window">
      {/* Chat header */}
      <div className="chat-header">
        <button className="back-button" onClick={onBack}>
          ←
        </button>
        <div className="chat-partner-info">
          <div className="partner-avatar">
            {otherUser?.pseudonym?.charAt(0).toUpperCase()}
            {isOtherUserOnline && <div className="online-dot"></div>}
          </div>
          <div className="partner-details">
            <h3>{otherUser?.pseudonym || 'Unknown User'}</h3>
            <span className="partner-status">
              {isOtherUserOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      </div>

      {/* Messages container */}
      <div className="messages-container">
        {allMessages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet</p>
            <span>Start the conversation by sending a message!</span>
          </div>
        ) : (
          allMessages.map(message => (
            <Message
              key={message._id || message.messageId}
              message={message}
              isOwn={message.senderId === currentUser.userId}
              isOptimistic={message.isOptimistic}
            />
          ))
        )}

        {/* Typing indicator */}
        {chatTypingUsers.length > 0 && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="typing-text">
              {otherUser?.pseudonym} is typing...
            </span>
          </div>
        )}

        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form className="message-input-form" onSubmit={handleSendMessage}>
        <div className="input-container">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
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