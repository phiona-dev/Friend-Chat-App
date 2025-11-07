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
      }
    ]
  }

  const handleSendMessage = (messageContent) => {
    if (!currentChat) return;

    const newMessage = {
      messageId: `msg${Date.now()}`, //simple unique id
      senderId: mockCurrentUser.userId,
      content: messageContent,
      timestamp: new Date(),
      isRead: false
    }

    //update the chat with the new message
    const updatedChat = {
      ...currentChat,
      messages: [...currentChat.messages, newMessage]
    }

    setCurrentChat(updatedChat)
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
      onSendMessage={handleSendMessage}
    />
    </div>
  )
}

export default App