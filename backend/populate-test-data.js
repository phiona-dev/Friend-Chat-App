const mongoose = require('mongoose');
require('dotenv').config();

const Chat = require('./models/Chat');
const Message = require('./models/Message');
const User = require('./models/User');

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
          avatar: '/avatars/user2.png',
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
          avatar: '/avatars/user3.png',
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

    console.log('Test data created successfully!');
    console.log('Created 2 chats with messages');
    
    // Verify the data
    const chatCount = await Chat.countDocuments();
    const messageCount = await Message.countDocuments();
    console.log(`Total chats: ${chatCount}, Total messages: ${messageCount}`);

    // --- seed demo users (always run, don't catch errors) ---
    console.log('\nSeeding demo users...');
    const demoUsers = [
      {
        userId: 'user2',
        pseudonym: 'StarGazer',
        email: 'stargazer@example.com',
        about: 'Future innovator with a passion for coding and community impact',
        interests: ['Coding', 'AI', 'Volunteering', 'Gaming'],
        avatar: '/avatars/user2.png'
      },
      {
        userId: 'user3',
        pseudonym: 'CampusHero',
        email: 'campushero@example.com',
        about: 'Study group leader and campus volunteer',
        interests: ['Volunteering', 'Debate', 'Business'],
        avatar: '/avatars/user3.png'
      },
      {
        userId: 'user4',
        pseudonym: 'CodeNinja',
        email: 'codeninja@example.com',
        about: 'Competitive coder and open-source contributor',
        interests: ['Coding', 'AI', 'Science'],
        avatar: '/avatars/user4.png'
      },
      {
        userId: 'user5',
        pseudonym: 'ArtisticAmy',
        email: 'amy@example.com',
        about: 'Artist who loves photography and film',
        interests: ['Art & Design', 'Photography', 'Film & TV'],
        avatar: '/avatars/user5.png'
      },
      {
        userId: 'user6',
        pseudonym: 'GamerGal',
        email: 'gamer@example.com',
        about: 'Casual gamer and event organizer',
        interests: ['Gaming', 'Music', 'Food & Cooking'],
        avatar: '/avatars/user6.png'
      },
      {
        userId: 'user7',
        pseudonym: 'TravelerTom',
        email: 'tom@example.com',
        about: 'Backpacker and food enthusiast',
        interests: ['Travel', 'Food & Cooking', 'Photography'],
        avatar: '/avatars/user7.png'
      }
    ];

    for (const u of demoUsers) {
      try {
        await User.findOneAndUpdate(
          { userId: u.userId },
          { $set: u },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        console.log('✅ Upserted user:', u.userId);
      } catch (err) {
        console.error('❌ Failed to upsert user', u.userId, err.message);
      }
    }

    console.log('Demo users seeded successfully!');

  } catch (error) {
    console.error('❌ Error creating test data:', error);
    mongoose.connection.close();
  }
};

populateTestData();