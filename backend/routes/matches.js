const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const { getMatchesForUser } = require('../utils/matchingAlgorithm');

// In-memory store for demo pending matches per user (not persistent)
// In a real app this would be a DB collection (e.g., Match model)
const pendingMatchesStore = new Map();

// Seed some demo data for user1 if none exists
const ensureSeedForUser = (userId) => {
  if (!pendingMatchesStore.has(userId)) {
    const demo = [
      {
        matchId: 'match1',
        pseudonym: 'BookLover42',
        interests: ['Reading', 'Technology', 'Coffee', 'Travel'],
        bio: 'Love reading sci-fi and exploring new tech trends!',
        timestamp: new Date(Date.now() - 3600000),
        avatar: '/avatars/booklover.jpg'
      },
      {
        matchId: 'match2',
        pseudonym: 'SportsFanatic',
        interests: ['Basketball', 'Fitness', 'Music'],
        bio: 'Always up for a game of basketball or gym session',
        timestamp: new Date(Date.now() - 7200000),
        avatar: '/avatars/sportsfanatic.jpg'
      },
      {
        matchId: 'match3',
        pseudonym: 'ArtExplorer',
        interests: ['Painting', 'Museums', 'Photography'],
        bio: 'Contemporary art enthusiast and amateur photographer',
        timestamp: new Date(Date.now() - 1800000),
        avatar: '/avatars/artexplorer.jpg'
      }
    ];
    pendingMatchesStore.set(userId, demo);
  }
};

// GET /api/matches/:userId - return pending matches for user
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

    // Calculate matches
    const matches = getMatchesForUser(currentUser, allUsers);

    // Debug/logging to help diagnose runtime issues
    console.log(`Matches computed for ${userId}:`, Array.isArray(matches) ? matches.length : typeof matches);
    if (Array.isArray(matches) && matches.length > 0) {
      console.log('Sample match object:', JSON.stringify(matches[0], null, 2));
    }

    // Return match profiles
    const response = (Array.isArray(matches) ? matches : []).map(match => {
      const matchId = (match && match._id && typeof match._id.toString === 'function')
        ? match._id.toString()
        : (match && match.userId) || `match-${Math.random().toString(36).slice(2,9)}`;

      return {
        matchId,
        userId: match && match.userId,
        pseudonym: match && match.pseudonym,
        avatar: (match && match.avatar) || '/avatars/user1.jpg',
        about: (match && match.about) || '',
        interests: Array.isArray(match && match.interests) ? match.interests : [],
        similarityScore: (match && match.similarityScore) || 0
      };
    });

    res.json(response);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get matches', error: err.message });
  }
});

// POST /api/matches/:matchId/accept - mark a match as accepted and create or return a chat
router.post('/:matchId/accept', async (req, res) => {
  try {
    const { matchId } = req.params;
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    ensureSeedForUser(userId);

    // find and remove match from pending for this user
    const matches = pendingMatchesStore.get(userId) || [];
    const matchIndex = matches.findIndex(m => m.matchId === matchId);
    if (matchIndex !== -1) {
      const [matchObj] = matches.splice(matchIndex, 1);
      pendingMatchesStore.set(userId, matches);

      // translate match to a user id for the other participant (frontend uses `user-<matchId>`)
      const otherUserId = `user-${matchId}`;

      // Check if chat already exists between userId and otherUserId
      let existingChat = await Chat.findOne({
        'participants.userId': { $all: [userId, otherUserId] }
      });

      if (existingChat) {
        return res.json({ success: true, chat: existingChat });
      }

      // Create a new chat
      const participant1 = { userId, pseudonym: 'You', avatar: '/avatars/user1.jpg' };
      const participant2 = { userId: otherUserId, pseudonym: matchObj.pseudonym, avatar: matchObj.avatar };

      const newChat = new Chat({ participants: [participant1, participant2] });
      await newChat.save();

      // Create a system welcome message
      const systemMessage = new Message({
        chatId: newChat._id,
        senderId: 'system',
        content: `You matched with ${matchObj.pseudonym}! Start a conversation.`,
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
    }

    // If match not found, return success but no chat
    return res.json({ success: true });
  } catch (err) {
    console.error('Error accepting match:', err);
    res.status(500).json({ error: 'Failed to accept match' });
  }
});

// POST /api/matches/:matchId/reject - mark a match as rejected
router.post('/:matchId/reject', async (req, res) => {
  try {
    const { matchId } = req.params;
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    ensureSeedForUser(userId);
    const matches = pendingMatchesStore.get(userId) || [];
    const filtered = matches.filter(m => m.matchId !== matchId);
    pendingMatchesStore.set(userId, filtered);

    return res.json({ success: true });
  } catch (err) {
    console.error('Error rejecting match:', err);
    res.status(500).json({ error: 'Failed to reject match' });
  }
});

module.exports = router;
