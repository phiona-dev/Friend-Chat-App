//Main chat page
import React from 'react';
import ChatList from "../components/chat/ChatList";
import ChatWindow from "../components/chat/ChatWindow"

const ChatPage = () => {
  return (
    <div>
        <ChatList/>
        <ChatWindow/>
    </div>
  )
}

export default ChatPage