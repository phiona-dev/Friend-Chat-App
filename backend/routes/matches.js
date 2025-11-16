const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const Message = require('../models/Message');

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
    ensureSeedForUser(userId);
    const matches = pendingMatchesStore.get(userId) || [];
    res.json(matches);
  } catch (err) {
    console.error('Error fetching pending matches:', err);
    res.status(500).json({ error: 'Failed to fetch pending matches' });
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
