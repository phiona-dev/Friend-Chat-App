const express = require('express');
const router = express.Router();

// Basic test route
router.get('/', (req, res) => {
  res.json({ message: 'Chats API is working!' });
});

module.exports = router;