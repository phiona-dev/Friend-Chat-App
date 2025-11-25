const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const { getMatchesForUser } = require('../utils/matchingAlgorithm');

// GET /api/matches/:userId - return similarity-based matches for user from real profiles
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get current user's profile (use .lean() to return plain object)
    const currentUser = await User.findOne({ userId }).lean();
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all other users
    const allUsers = await User.find({ userId: { $ne: userId } }).lean();

    // Calculate matches using similarity algorithm
    const matches = getMatchesForUser(currentUser, allUsers);

    // Debug/logging to help diagnose runtime issues
    console.log(`Matches computed for ${userId}:`, Array.isArray(matches) ? matches.length : typeof matches);
    if (Array.isArray(matches) && matches.length > 0) {
      console.log('Sample match object:', JSON.stringify(matches[0], null, 2));
    }

    // Return match profiles – use Mongo _id as matchId
    const response = (Array.isArray(matches) ? matches : []).map(match => ({
      matchId: match && match._id && typeof match._id.toString === 'function' ? match._id.toString() : undefined,
      userId: match && match.userId,
      pseudonym: match && match.pseudonym,
      avatar: (match && match.avatar) || '/avatars/user1.jpg',
      about: (match && match.about) || '',
      interests: Array.isArray(match && match.interests) ? match.interests : [],
      similarityScore: (match && match.similarityScore) || 0
    }));

    res.json(response);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get matches', error: err.message });
  }
});

// POST /api/matches/:matchId/accept - accept a real user match and create or return a chat
router.post('/:matchId/accept', async (req, res) => {
  try {
    const { matchId } = req.params; // this is the matched user's _id
    const { userId } = req.body; // current userId (string used in User.userId)
    if (!userId) return res.status(400).json({ error: 'userId required' });

    // Look up the matched user by Mongo _id
    const matchedUser = await User.findById(matchId).lean();
    if (!matchedUser) {
      return res.status(404).json({ error: 'Matched user not found' });
    }

    const otherUserId = matchedUser.userId;

    // Check if chat already exists between userId and otherUserId
    let existingChat = await Chat.findOne({
      'participants.userId': { $all: [userId, otherUserId] }
    });

    if (existingChat) {
      return res.json({ success: true, chat: existingChat });
    }

    // Create a new chat using real user info
    const participant1 = { userId, pseudonym: 'You', avatar: '/avatars/user1.jpg' };
    const participant2 = { userId: otherUserId, pseudonym: matchedUser.pseudonym, avatar: matchedUser.avatar || '/avatars/user1.jpg' };

    const newChat = new Chat({ participants: [participant1, participant2] });
    await newChat.save();

    // Create a system welcome message
    const systemMessage = new Message({
      chatId: newChat._id,
      senderId: 'system',
      content: `You matched with ${matchedUser.pseudonym}! Start a conversation.`,
      messageType: 'system'
    });
    await systemMessage.save();

    // Optionally update chat.lastMessage
    newChat.lastMessage = {
      content: systemMessage.content,
      senderId: systemMessage.senderId,
      timestamp: systemMessage.timestamp
    };
    await newChat.save();

    return res.status(201).json({ success: true, chat: newChat });
  } catch (err) {
    console.error('Error accepting match:', err);
    res.status(500).json({ error: 'Failed to accept match' });
  }
});

// POST /api/matches/:matchId/reject - no-op for now (client can simply hide it)
router.post('/:matchId/reject', async (req, res) => {
  try {
    // Keeping this endpoint for API compatibility; no server-side state yet
    return res.json({ success: true });
  } catch (err) {
    console.error('Error rejecting match:', err);
    res.status(500).json({ error: 'Failed to reject match' });
  }
});

module.exports = router;
