const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';

function makeUserDto(user) {
  if (!user) return null;
  const { _id, userId, pseudonym, email, about, interests, avatar, createdAt, updatedAt } = user;
  return { _id, userId, pseudonym, email, about, interests, avatar, createdAt, updatedAt };
}

exports.register = async (req, res) => {
  try {
    const { email, password, pseudonym } = req.body;
    if (!email || !password || !pseudonym) return res.status(400).json({ error: 'Missing fields' });

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const userId = `u${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const user = new User({ userId, pseudonym, email: email.toLowerCase().trim(), passwordHash: hash });
    await user.save();

    const token = jwt.sign({ userId: user.userId }, JWT_SECRET, { expiresIn: '30d' });

    return res.json({ token, user: makeUserDto(user) });
  } catch (err) {
    console.error('auth.register error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.userId }, JWT_SECRET, { expiresIn: '30d' });
    return res.json({ token, user: makeUserDto(user) });
  } catch (err) {
    console.error('auth.login error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.me = async (req, res) => {
  try {
    const uid = req.user && req.user.userId;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });
    const user = await User.findOne({ userId: uid });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user: makeUserDto(user) });
  } catch (err) {
    console.error('auth.me error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
