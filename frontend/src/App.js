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
    messages: []
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

    <button
      onClick={() => setCurrentChat(null)}
      style={{padding: "10px", margin: "10px"}}
    >
      Close Chat Window
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