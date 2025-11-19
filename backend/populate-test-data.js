const mongoose = require('mongoose');
require('dotenv').config();

const Chat = require('./models/Chat');
const Message = require('./models/Message');

const populateTestData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to database, clearing old data...');
    
    // Clear existing data
    await Chat.deleteMany({});
    await Message.deleteMany({});
    
    console.log('Creating test chats...');

    // Create test chat 1
    const chat1 = new Chat({
      participants: [
        {
          userId: 'user1',
          pseudonym: 'You',
          avatar: '/avatars/user1.jpg',
          isOnline: true
        },
        {
          userId: 'user2',
          pseudonym: 'ChatterBox',
          avatar: '/avatars/user2.jpg',
          isOnline: true
        }
      ]
    });

    await chat1.save();

    // Create messages for chat1
    const message1 = new Message({
      chatId: chat1._id,
      senderId: 'user2',
      content: 'Hey there! How are you doing?',
      messageType: 'text'
    });

    const message2 = new Message({
      chatId: chat1._id,
      senderId: 'user1', 
      content: "I'm good! Just testing our chat app.",
      messageType: 'text'
    });

    await message1.save();
    await message2.save();

    // Update chat with last message
    chat1.lastMessage = {
      content: message2.content,
      senderId: message2.senderId,
      timestamp: message2.timestamp
    };
    await chat1.save();

    // Create test chat 2
    const chat2 = new Chat({
      participants: [
        {
          userId: 'user1',
          pseudonym: 'You', 
          avatar: '/avatars/user1.jpg',
          isOnline: true
        },
        {
          userId: 'user3',
          pseudonym: 'StudyBuddy',
          avatar: '/avatars/user3.jpg',
          isOnline: false
        }
      ]
    });

    await chat2.save();

    const message3 = new Message({
      chatId: chat2._id,
      senderId: 'user3',
      content: 'Did you finish the assignment?',
      messageType: 'text'
    });

    await message3.save();

    chat2.lastMessage = {
      content: message3.content,
      senderId: message3.senderId, 
      timestamp: message3.timestamp
    };
    await chat2.save();

    console.log('✅ Test data created successfully!');
    console.log('📝 Created 2 chats with messages');
    
    // Verify the data
    const chatCount = await Chat.countDocuments();
    const messageCount = await Message.countDocuments();
    console.log(`Total chats: ${chatCount}, Total messages: ${messageCount}`);

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    mongoose.connection.close();
  }
};

populateTestData();