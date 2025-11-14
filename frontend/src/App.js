import React, { useEffect, useState } from 'react';
import ChatWindow from './components/chat/chat-window/ChatWindow';
import ChatList from './components/chat/chat-list/ChatList';
import { chatAPI, matchingAPI } from './Services/api';
import { socketService } from './Services/socket';

const App = () => {

  const [currentView, setCurrentView] = useState('chatList'); 
  const [currentChat, setCurrentChat] = useState(null);
  const [chats, setChats] = useState([])
  const [pendingMatches, setPendingMatches] = useState([])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //mock data for testing
  //will be replaced with real auth later
  const mockCurrentUser = {
    userId: "user1",
    pseudonym: "You",
    isOnline: true,
    avatar: "/avatars/user1.jpg"
  }

  //will be replaced with real API later
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
    
  ];


  /*const mockChats = [
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
  }, []); */

  //load user's chats from API
  useEffect(() => {
    const initializeApp = async () => {
      await loadUserChats();
      initializeSocket();
      setPendingMatches(mockPendingMatches)
    };
    initializeApp();
  }, []);

  const loadUserChats = async () => {
    try {
      setLoading(true);
      const userChats = await chatAPI.getUserChats(mockCurrentUser.userId);
      
      console.log('Raw API response:', userChats); // Debug log
      
      // Transform the data to match frontend expectations
      const transformedChats = userChats.map(chat => ({
        _id: chat.chatId, // Map chatId to _id for frontend
        chatId: chat.chatId, // Keep original too
        participants: chat.participants,
        lastMessage: chat.lastMessage,
        unreadCount: chat.unreadCount || 0,
        messages: [], // Will load when chat is opened
        otherParticipant: chat.otherParticipant, // Keep this for easy access
        updatedAt: chat.updatedAt,
        createdAt: chat.createdAt
      }));
      
      console.log('Transformed chats:', transformedChats); // Debug log
      setChats(transformedChats);
    } catch (err) {
      setError("Failed to load chats");
      console.error("Error loading chats:", err);
    } finally {
      setLoading(false);
    }
  };

  const initializeSocket = () => {
    const socket = socketService.connect();

    //listen for new messages in real-time
    socket.on("new_message", (message) => {
      //if message is for the current chat, update it
      if (currentChat && currentChat._id === message.chatId){
        setCurrentChat(prev => ({
          ...prev,
          messages: [...prev.messages, message]
        }));
      }

      //update the chat in the chats list
      setChats(prev => prev.map(chat => 
        chat._id === message.chatId ? {
          ...chat,
          lastMessage: {
            content: message.content,
            timestamp: message.timestamp,
            senderId: message.senderId
          },
          updatedAt: new Date()
        } : chat
      ));
    });
  };

  const handleSelectChat = async (chat) => {
    try {
      setLoading(true)
      //load messages for this chat
      const messages = await chatAPI.getChatMessages(chat._id);

      //mark messages as read
      await chatAPI.markMessagesAsRead(chat._id, mockCurrentUser.userId);

      const chatWithMessages= {
        ...chat,
        messages: messages,
        unreadCount: 0
      };

      setCurrentChat(chatWithMessages);
      setCurrentView("chatWindow");

      //join the chat room for real-time updates
      setChats(prev => prev.map(c => c._id === chat._id ? { ...c, unreadCount: 0 } : c
      ));
    } catch (err) {
      setError("Failed to load chat messages");
      console.error("Error loading messages:", err);
    } finally {
      setLoading(false);
    };
  }

  const handleAcceptMatch = async (match) => {
    try {
      //create a new chat with the accepted match
      const newChat = await chatAPI.createChat(
        {
          userId: mockCurrentUser.userId,
          pseudonym: mockCurrentUser.pseudonym,
          avatar: mockCurrentUser.avatar
        },
        {
          userId: `user-${match.matchId}`,
          pseudonym: match.pseudonym,
          avatar: match.avatar
        }
      );

      //remove from pending matches
      setPendingMatches(prev => prev.filter(m => m.matchId !== match.matchId));

      //add new chat to chats list
      setChats(prev => [newChat, ...prev]);
      alert(`You matched with ${match.pseudonym}! You can now chat with them.`);

    } catch (err) {
      setError("Failed to accept match");
      console.error("Error accepting match:", err);
    }
  };

  const handleRejectMatch = (match) => {
    //remove from pending matches
    setPendingMatches(prev => prev.filter(m => m.matchId !== match.matchId));
    alert(`You rejected ${match.pseudonym}`)
  }

  const handleSendMessage = async (messageContent) => {
    if (!currentChat) return;

    try {
      //send message via api
      const newMessage = await chatAPI.sendMessage(
        currentChat._id,
        mockCurrentUser.userId,
        messageContent
      );

      //real-time update will handle adding the message to the UI via the
      //socket "new_message" event
    } catch (err) {
      setError("Failed to send message");
      console.error("Error sending message:", err)
    }
  };


  const handleBackToList = () => {
    if (currentChat) {
      socketService.leaveChat(currentChat._id);
    }
    setCurrentView("chatList");
    setCurrentChat(null);
  }

  //cleanup socket on unmount
  useEffect(() => {
    return () => {
      socketService.disconnect();
    };
  }, []);

  if (loading && chats.length === 0) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading your chats...</p>
      </div>
    );
  }

  return (
    <div className="App">
      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError(null)}>x</button>
        </div>
      )}
      
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