import React, { useState } from 'react';
import ChatWindow from './components/chat/chat-window/ChatWindow';
import ChatList from './components/chat/chat-list/ChatList';

const App = () => {

  const [currentView, setCurrentView] = useState('chatList'); 
  const [currentChat, setCurrentChat] = useState(null);
  const [chats, setChats] = useState([])
  const [pendingMatches, setPendingMatches] = useState([])

  //mock data for testing
  const mockCurrentUser = {
    userId: "user1",
    pseudonym: "You",
    isOnline: true,
    avatar: "/avatars/user1.jpg"
  }

  const mockPendingMatches = [
    {
      matchId: "match1",
      pseudonym: "BookLover42",
      interests: ["Reading", "Technology", "Coffee", "Travel"],
      bio: "Love reading sci-fi and exploring new tech trends!",
      timestamp: new Date(Date.now() - 3600000), //1 hour ago
      avatar: "/avatars/booklover.jpg"
    },
    {
      matchId: "match2",
      pseudonym: "SportsFanatic",
      interests: ["Basketball", "Fitness", "Music"],
      bio: "Always up for a game of basketball or gym session",
      timestamp: new Date(Date.now() - 7200000), //2 hours ago
      avatar: "/avatars/sportsfanatic.jpg"
    },
    {
      matchId: "match3",
      pseudonym: "ArtExplorer",
      interests: ["Painting", "Museums", "Photography"],
      bio: "Contemporary art enthusiast and amateur photographer",
      timestamp: new Date(Date.now() - 1800000), //1 hour ago
      avatar: "/avatars/artexplorer.jpg"
    },
    
  ]

  const mockChats = [
    {
    chatId: "chat1",
    participants: [
      {
        userId: "user1",
        pseudonym: "You",
        isOnline: true,
        avatar: "/avatars/user1.jpg"
      },
      {
        userId: "user2",
        pseudonym: "Chatterbox", 
        isOnline: true,
        avatar: "/avatars/chatterbox.jpg"
      },
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
          messageId: 'msg2',
          senderId: 'user1',
          content: "I'm good! Just working on our chat app.",
          timestamp: new Date(Date.now() - 240000), // 4 minutes ago
          isRead: true
        },
        {
          messageId: 'msg3',
          senderId: 'user2',
          content: "That's awesome! Can I test it?",
          timestamp: new Date(Date.now() - 120000), // 2 minutes ago
          isRead: false
        }
    ],
    unreadCount: 1
    },
    {
      chatId: 'chat2',
      participants: [
        {
          userId: 'user1',
          pseudonym: 'You',
          isOnline: true,
          avatar: "/avatars/user1.jpg"
        },
        {
          userId: 'user3',
          pseudonym: 'StudyBuddy',
          isOnline: false,
          avatar: "/avatars/booklover.jpg"
        }
      ],
      messages: [
        {
          messageId: 'msg4',
          senderId: 'user3',
          content: 'Did you finish the software engineering assignment?',
          timestamp: new Date(Date.now() - 86400000), // 1 day ago
          isRead: false
        }
      ],
      unreadCount: 1
    }
  ]

  //initialize state with mock data
  React.useEffect(() => {
    setChats(mockChats);
    setPendingMatches(mockPendingMatches)
  }, []);

  const handleSelectChat = (chat) => {
    setCurrentChat(chat);
    setCurrentView("chatWindow");

    //mark messages are read when chat is selected
    const updatedChats = chats.map(c => 
      c.chatId === chat.chatId ? {
        ...c,
        unreadCount: 0,
        messages: c.messages.map(m => ({ ...m, isRead: true }))
      } : c
    )
    setChats(updatedChats)
  }

  const handleAcceptMatch = (match) => {
    console.log("Accepted match:", match.pseudonym);

    //remove from pending matches
    const updatedPendingMatches = pendingMatches.filter(m => m.matchId !== match.matchId);
    setPendingMatches(updatedPendingMatches);

    //create a new chat with this match
    const newChat = {
      chatId: `chat-${Date.now()}`,
      participants: [
        { userId: "user1", pseudonym: "You", isOnline: true },
        { userId: `user-${match.matchId}`, pseudonym: match.pseudonym, isOnline: true }
      ],
      messages: [
        {
          messageId: `msg-${Date.now()}`,
          senderId: "system",
          content: `You matched with ${match.pseudonym}! Start a conversation.`,
          timestamp: new Date(),
          isRead: true
        }
      ],
      unreadCount: 0
    }

    //Add to chats list
    setChats(prevChats => [...prevChats, newChat]);

    alert(`You matched with ${match.pseudonym}! You can now chat with them.`)
  };

  const handleRejectMatch = (match) => {
    console.log("Rejected match:", match.pseudonym);

    //remove from pending matches
    const updatedPendingMatches = pendingMatches.filter(m => m.matchId !== match.matchId);
    setPendingMatches(updatedPendingMatches);
    alert(`You rejected ${match.pseudonym}`)
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
      messages: [...currentChat.messages, newMessage],
      unreadCount: 0
    }

    setCurrentChat(updatedChat)

    //updated the chat in the chats list
    const updatedChats = chats.map(chat => chat.chatId === currentChat.chatId ? updatedChat : chat);
    setChats(updatedChats)
  }

  const handleBackToList = () => {
    setCurrentView("chatList");
    setCurrentChat(null);
  }

  return (
    <div className="App">
      {currentView === "chatList" ? (
        <ChatList
          chats={chats}
          pendingMatches={pendingMatches}
          onSelectChat={handleSelectChat}
          onAcceptMatch={handleAcceptMatch}
          onRejectMatch={handleRejectMatch}
          currentUser={mockCurrentUser}
        />
      ) : (
        <ChatWindow
          currentChat={currentChat}
          currentUser={mockCurrentUser}
          onBack={handleBackToList}
          onSendMessage={handleSendMessage}
        />
      )}
    </div>
  )
}

export default App