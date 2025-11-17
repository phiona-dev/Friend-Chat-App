//Single message component
//A message can be either sent by you(right-hand side) or sent by them
import React from 'react';
import "./Message.css"


const Message = ({ message, isOwn }) => {
    //format the time
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };
  return (
    <div className={`message ${isOwn ? "own-message" : "other-message"}`}>
        <div className="message-bubble">
            <p className="message-content">{message.content}</p>
            <div className="message-meta">
                <span className="message-time">
                    {formatTime(message.timestamp)}
                </span>
                {isOwn && (
                    <span className="message-status">
                        {message.isRead ? "✓✓" : "✓"}
                    </span>
                )}
            </div>
        </div>
    </div>
  )
}

export default Message