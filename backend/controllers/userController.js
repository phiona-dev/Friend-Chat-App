const User = require('../models/User');

// Create or update a user profile
async function createOrUpdateUser(req, res) {
  try {
    const { userId, pseudonym, email, about, interests, avatar } = req.body;
    if (!userId || !pseudonym) {
      return res.status(400).json({ message: 'userId and pseudonym are required' });
    }
    const user = await User.findOneAndUpdate(
      { userId },
      { userId, pseudonym, email, about, interests, avatar },
      { new: true, upsert: true }
    );
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ message: 'Failed to save profile', error: err.message });
  }
}

// Get user profile by userId
async function getUserProfile(req, res) {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: 'Failed to fetch profile', error: err.message });
  }
}

module.exports = {
  createOrUpdateUser,
  getUserProfile,
};