const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const postController = require('../controllers/postController');

// Multer storage for post images
const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
	filename: (req, file, cb) => {
		const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
		cb(null, unique + path.extname(file.originalname));
	}
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } }); // 2MB limit

router.post('/', upload.single('image'), postController.createPost);
router.get('/', postController.listPosts);
router.get('/:id', postController.getPost);
router.post('/:id/like', postController.toggleLike);
router.post('/:id/comments', postController.addComment);
router.post('/:id/report', postController.reportPost);

module.exports = router;
