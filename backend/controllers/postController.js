const Post = require('../models/Post');

// Create a new post (supports optional image via multer)
exports.createPost = async (req, res) => {
  try {
    console.log('[createPost] body:', req.body, 'file:', req.file && req.file.filename);
    const { userId, pseudonym, title, content, tags, category } = req.body;
    if (!userId || !content) {
      return res.status(400).json({ error: 'userId and content are required' });
    }
    const tagsArr = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : []);
    const allowedCategories = ['Memes','Events','Questions','Announcements','General'];
    const finalCategory = allowedCategories.includes(category) ? category : 'General';
    let imageUrl;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }
    const post = await Post.create({ userId, pseudonym, title, content, tags: tagsArr, category: finalCategory, imageUrl });
    return res.status(201).json(post);
  } catch (err) {
    console.error('createPost error', err);
    return res.status(500).json({ error: 'Failed to create post' });
  }
};

// List posts with optional tag or text search & pagination
exports.listPosts = async (req, res) => {
  try {
    console.log('[listPosts] query:', req.query);
    const { page = 1, limit = 20, q, tag, category } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = {};
    if (q) {
      filter.$text = { $search: q };
    }
    if (tag) filter.tags = tag;
    if (category && category !== 'All') filter.category = category;
    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    const total = await Post.countDocuments(filter);
    return res.json({ items: posts, total, page: parseInt(page) });
  } catch (err) {
    console.error('listPosts error', err);
    return res.status(500).json({ error: 'Failed to list posts' });
  }
};

// Get single post
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    return res.json(post);
  } catch (err) {
    console.error('getPost error', err);
    return res.status(500).json({ error: 'Failed to fetch post' });
  }
};

// Toggle like
exports.toggleLike = async (req, res) => {
  try {
    console.log('[toggleLike] params:', req.params, 'body:', req.body);
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const idx = post.likes.indexOf(userId);
    if (idx === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(idx, 1);
    }
    await post.save();
    return res.json({ likes: post.likes, liked: idx === -1 });
  } catch (err) {
    console.error('toggleLike error', err);
    return res.status(500).json({ error: 'Failed to toggle like' });
  }
};

// Add comment
exports.addComment = async (req, res) => {
  try {
    console.log('[addComment] params:', req.params, 'body:', req.body);
    const { userId, pseudonym, content } = req.body;
    if (!userId || !content) return res.status(400).json({ error: 'userId and content required' });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    post.comments.push({ userId, pseudonym, content });
    await post.save();
    return res.status(201).json(post.comments[post.comments.length - 1]);
  } catch (err) {
    console.error('addComment error', err);
    return res.status(500).json({ error: 'Failed to add comment' });
  }
};

// Report post
exports.reportPost = async (req, res) => {
  try {
    console.log('[reportPost] params:', req.params, 'body:', req.body);
    const { userId, reason } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    post.reports.push({ userId, reason });
    await post.save();
    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error('reportPost error', err);
    return res.status(500).json({ error: 'Failed to report post' });
  }
};
