import React, { useState } from 'react';
import Message from './components/chat/message/Message';
import ChatWindow from './components/chat/chat-window/ChatWindow';

const App = () => {

  const [currentChat, setCurrentChat] = useState(null)

  //mock data for testing
  const mockCurrentUser = {
    userId: "user1",
    pseudonym: "You",
    isOnline: true
  }

  const mockChat = {
    chatId: "chat1",
    participants: [
      { userId: "user1", pseudonym: "You", isOnline: true},
      { userId: "user2", pseudonym: "Chatterbox", isOnline: true},
    ],
    messages: [
      {
        messageId: "msg1",
        senderId: "user2",
        content: "Hey there! How are you doing?",
        timestamp: new Date(Date.now() - 300000), //5 minutes ago
        isRead: true
      },
      {
        messageId: "msg2",
        senderId: "user1",
        content: "I'm good! Just working on our chat app.",
        timestamp: new Date(Date.now() - 240000), //4 minutes ago
        isRead: true
      },
      {
        messageId: "msg3",
        senderId: "user2",
        content: "That's awesome! Can i test it?",
        timestamp: new Date(Date.now() - 120000), //2 minutes ago
        isRead: false
      },
    ]
  }

  

  return (
    <div className="App">
    <h2>Testing ChatWindow Header</h2>
    <button
      onClick={() => setCurrentChat(mockChat)}
      style={{padding: "10px", margin: "10px"}}
    >
    Open Chat Window
    </button>

    <ChatWindow
      currentChat={currentChat}
      currentUser={mockCurrentUser}
      onBack={() => setCurrentChat(null)}
    />
    </div>
  )
}

export default App