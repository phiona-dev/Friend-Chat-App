// routes/lostfound.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const ctrl = require('../controllers/lostFoundController');

// Configure proper file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Use .any() but with proper storage
router.post('/', upload.any(), ctrl.createReport);

// Your other routes...
router.get('/', ctrl.getItems);
router.get('/:id', ctrl.getItemById);
router.patch('/:id/status', ctrl.updateItemStatus);

module.exports = router;