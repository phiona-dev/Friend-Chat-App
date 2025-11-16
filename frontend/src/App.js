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
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [processedMatches, setProcessedMatches] = useState(() => {
    try {
      const saved = localStorage.getItem('processedMatches');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (err) {
      console.error('Failed to read processedMatches from localStorage', err);
      return new Set();
    }
  })

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

  useEffect(() => {

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
        setCurrentChat(prev => {
          if (prev && (prev.chatId === message.chatId || prev._id === message.chatId)){
            return {
              ...prev,
              messages: [...prev.messages, message]
            };
          }
          return prev;
        })

        //update the chat in the chats list
        setChats(prev => prev.map(chat => 
          (chat.chatId === message.chatId || chat._id === message.chatId) ? {
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

      //online status listener
      socket.on("onlineUsers", (users) => {
        setOnlineUsers(users);
        console.log("Online users updated:", users);
      });

      //typing indicator listeners
      socket.on("userTyping", (data) => {
        setTypingUsers(prev => ({
          ...prev,
          [data.chatId]: [...(prev[data.chatId] || []).filter(id => id !== data.userId), data.userId]
        }));
      });

      socket.on("userStopTyping", (data) => {
        setTypingUsers(prev => ({
          ...prev,
          [data.chatId]: (prev[data.chatId] || []).filter(id => id !== data.userId)
        }));
      });

      //connection logging
      socket.on("connect", () => {
        console.log("Socket connected successfully")
        socketService.setUserOnline(mockCurrentUser.userId)
      });

      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error)
      })
    };

    const initializeApp = async () => {
      await loadUserChats();
      initializeSocket();
      setPendingMatches(mockPendingMatches)
    };
    initializeApp();
    
  }, [])


  const handleSelectChat = async (chat) => {
    try {
      setLoading(true)

      //use chatId if available otherwise _id
      const chatIdentifier = chat.chatId || chat._id;

      //load messages for this chat
      const messages = await chatAPI.getChatMessages(chatIdentifier);

      //mark messages as read
      await chatAPI.markMessagesAsRead(chatIdentifier, mockCurrentUser.userId);

      const chatWithMessages= {
        ...chat,
        messages: messages,
        unreadCount: 0
      };

      setCurrentChat(chatWithMessages);
      setCurrentView("chatWindow");

      //join the chat room for real-time updates
      socketService.joinChat(chatIdentifier);

      //update chats list to reflect read status
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
    console.log('Accept clicked for', match.matchId);
    try {
      //check if match was already processed
      if (processedMatches.has(match.matchId)) {
        alert("This match has already been processed");
        return;
      }

      // Optimistically mark processed and remove from pending
      const tempChatId = `temp-${match.matchId}`;
      setProcessedMatches(prev => new Set([...prev, match.matchId]));
      setPendingMatches(prev => prev.filter(m => m.matchId !== match.matchId));

      // insert a placeholder chat so UI updates immediately
      const placeholderChat = {
        _id: tempChatId,
        chatId: tempChatId,
        participants: [
          { userId: mockCurrentUser.userId, pseudonym: mockCurrentUser.pseudonym, avatar: mockCurrentUser.avatar },
          { userId: `user-${match.matchId}`, pseudonym: match.pseudonym, avatar: match.avatar }
        ],
        lastMessage: { content: `You matched with ${match.pseudonym}!`, timestamp: new Date(), senderId: 'system' },
        unreadCount: 0,
        messages: [],
        otherParticipant: { userId: `user-${match.matchId}`, pseudonym: match.pseudonym, avatar: match.avatar },
        updatedAt: new Date(),
        createdAt: new Date()
      };

      setChats(prev => [placeholderChat, ...prev]);

      //call API to create chat; if it fails, rollback optimistic updates
      let newChat = null;
      try {
        newChat = await chatAPI.createChat(
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
      } catch (apiErr) {
        // rollback
        setProcessedMatches(prev => {
          const copy = new Set(prev);
          copy.delete(match.matchId);
          return copy;
        });
        setPendingMatches(prev => [match, ...prev]);
        setChats(prev => prev.filter(c => c._id !== tempChatId));
        setError('Failed to accept match (network)');
        console.error('createChat failed:', apiErr);
        alert('Failed to accept match. Please try again.');
        return;
      }

      // Replace placeholder with actual chat returned by API
      const transformedChat = {
        _id: newChat._id,
        chatId: newChat._id,
        participants: newChat.participants,
        lastMessage: newChat.lastMessage,
        unreadCount: 0,
        messages: [],
        otherParticipant: newChat.participants.find(p => p.userId !== mockCurrentUser.userId),
        updatedAt: newChat.updatedAt,
        createdAt: newChat.createdAt
      };

      setChats(prev => prev.map(c => c._id === tempChatId ? transformedChat : c));
      alert(`You matched with ${match.pseudonym}! You can now chat with them.`);

    } catch (err) {
      setError("Failed to accept match");
      console.error("Error accepting match:", err);
    }
  };

  const handleRejectMatch = async (match) => {
    try {
      console.log('Reject clicked for', match.matchId);
      //check if match was already processed
      if (processedMatches.has(match.matchId)) {
        alert("This match has already been processed");
        return;
      }

      //mark match as processed
      setProcessedMatches(prev => new Set([...prev, match.matchId]));

      //remove from pending matches
      setPendingMatches(prev => prev.filter(m => m.matchId !== match.matchId));
      alert(`You rejected ${match.pseudonym}`)
    } catch (err) {
      setError("Failed to reject match");
      console.error("Error rejecting match", err)
    }
  };

  // Save processed matches to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('processedMatches', JSON.stringify([...processedMatches]));
  }, [processedMatches]);

  // Filter out already processed matches from pendingMatches
  const filteredPendingMatches = pendingMatches.filter(
    match => !processedMatches.has(match.matchId)
  );

  const handleSendMessage = async (messageContent) => {
    if (!currentChat) return;

    try {
      //use chatId if available, otherwise _id
      const chatIdentifier = currentChat.chatId || currentChat._id;

      //send message via api
      await chatAPI.sendMessage(
        chatIdentifier,
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

  const handdleTypingStart = () => {
    if (currentChat) {
      const chatIdentifier = currentChat.chatId || currentChat._id;
      socketService.startTyping(chatIdentifier, mockCurrentUser.userId);
    }
  };

  const handdleTypingStop = () => {
    if (currentChat) {
      const chatIdentifier = currentChat.chatId || currentChat._id;
      socketService.stopTyping(chatIdentifier, mockCurrentUser.userId);
    }
  };

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
          pendingMatches={filteredPendingMatches}
          onSelectChat={handleSelectChat}
          onAcceptMatch={handleAcceptMatch}
          onRejectMatch={handleRejectMatch}
          currentUser={mockCurrentUser}
          onlineUsers={onlineUsers}
        />
      ) : (
        <ChatWindow
          currentChat={currentChat}
          currentUser={mockCurrentUser}
          onBack={handleBackToList}
          onSendMessage={handleSendMessage}
          onTypingStart={handdleTypingStart}
          onTypingStop={handdleTypingStop}
          typingUsers={typingUsers[currentChat?.chatId || currentChat?._id] || []}
          onlineUsers={onlineUsers}
        />
      )}
    </div>
  )
}

export default App
