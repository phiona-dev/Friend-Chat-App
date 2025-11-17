const mongoose = require('mongoose');
require('dotenv').config();

// Import our models
const Chat = require('./models/Chat');
const Message = require('./models/Message');

// Connect to database
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const testModels = async () => {
  try {
    console.log('Testing database models...');
    
    // Create a test chat
    const testChat = new Chat({
      participants: [
        {
          userId: 'user1',
          pseudonym: 'TestUser1',
          avatar: '/avatars/user1.jpg',
          isOnline: true
        },
        {
          userId: 'user2', 
          pseudonym: 'TestUser2',
          avatar: '/avatars/user2.jpg',
          isOnline: false
        }
      ]
    });
    
    await testChat.save();
    console.log('✅ Chat created successfully:', testChat._id);
    
    // Create a test message
    const testMessage = new Message({
      chatId: testChat._id,
      senderId: 'user1',
      content: 'Hello, this is a test message!',
      messageType: 'text'
    });
    
    await testMessage.save();
    console.log('✅ Message created successfully:', testMessage._id);
    
    // Test the chat methods
    const otherUser = testChat.getOtherParticipant('user1');
    console.log('✅ Other participant:', otherUser.pseudonym);
    
    // Test unread count method
    testChat.incrementUnreadCount('user2');
    await testChat.save();
    console.log('✅ Unread count updated');
    
    console.log('🎉 All model tests passed!');
    
  } catch (error) {
    console.error('❌ Error testing models:', error);
  } finally {
    mongoose.connection.close();
  }
};

testModels();