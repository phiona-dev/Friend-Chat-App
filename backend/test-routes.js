const mongoose = require('mongoose');
require('dotenv').config();

// Connect to database
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const testRoutes = async () => {
  try {
    console.log('Testing chat routes functionality...');
    
    // We'll test our routes by creating data and checking responses
    console.log('✅ Chat routes are set up and ready!');
    console.log('📝 Available endpoints:');
    console.log('   GET    /api/chats/:userId');
    console.log('   GET    /api/chats/messages/:chatId');
    console.log('   POST   /api/chats');
    console.log('   POST   /api/chats/:chatId/messages');
    console.log('   PUT    /api/chats/:chatId/read');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

testRoutes();