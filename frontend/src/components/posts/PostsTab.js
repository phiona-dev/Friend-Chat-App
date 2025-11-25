import React, { useEffect, useState } from 'react';
import { postsAPI } from '../../Services/api';
import './PostsTab.css';

const PostsTab = () => {
  const profile = JSON.parse(localStorage.getItem('currentUserProfile') || '{}');
  const userId = profile.userId || 'user1';
  const pseudonym = profile.pseudonym || 'You';

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');

  const loadPosts = async () => {
    try {
      setLoading(true);
      const res = await postsAPI.list(1, 50, search);
      setPosts(res.items || []);
    } catch (err) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPosts(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setCreating(true);
    try {
      const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      const newPost = await postsAPI.create({ userId, pseudonym, title: title.trim(), content: content.trim(), tags: tagArray });
      setPosts(prev => [newPost, ...prev]);
      setContent('');
      setTitle('');
      setTags('');
    } catch (err) {
      setError('Failed to create post');
    } finally {
      setCreating(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await postsAPI.toggleLike(postId, userId);
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, likes: res.likes } : p));
    } catch (err) {
      console.error('like failed');
    }
  };

  const handleComment = async (postId, text) => {
    if (!text.trim()) return;
    try {
      const comment = await postsAPI.addComment(postId, { userId, pseudonym, content: text.trim() });
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, comments: [...p.comments, comment] } : p));
    } catch (err) {
      console.error('comment failed');
    }
  };

  return (
    <div className="posts-tab">
      <h2>General Posts</h2>
      <form onSubmit={handleCreate} className="post-create-form">
        <input
          type="text"
          placeholder="Optional title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          disabled={creating}
        />
        <textarea
          placeholder="Share something with everyone..."
          value={content}
          onChange={e => setContent(e.target.value)}
          disabled={creating}
          rows={3}
        />
        <input
          type="text"
          placeholder="tags (comma separated)"
          value={tags}
          onChange={e => setTags(e.target.value)}
          disabled={creating}
        />
        <button type="submit" disabled={creating || !content.trim()}>Post</button>
      </form>

      <div className="posts-controls">
        <input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button onClick={loadPosts}>Search</button>
      </div>

      {loading ? <p>Loading posts...</p> : error ? <p className="error">{error}</p> : (
        <ul className="post-list">
          {posts.map(post => (
            <li key={post._id} className="post-item">
              {post.title && <h3>{post.title}</h3>}
              <p className="meta">By {post.pseudonym || 'Anon'} • {new Date(post.createdAt).toLocaleString()} • {post.tags && post.tags.length ? post.tags.map(t => `#${t}`).join(' ') : ''}</p>
              <p>{post.content}</p>
              {post.imageUrl && (
                <img src={post.imageUrl} alt="post" style={{ maxWidth: '100%', marginTop: '0.5rem', borderRadius: '8px' }} />
              )}
              <div className="post-actions">
                <button onClick={() => handleLike(post._id)}>❤️ {post.likes ? post.likes.length : 0}</button>
              </div>
              <CommentsSection post={post} onAdd={handleComment} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const CommentsSection = ({ post, onAdd }) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  return (
    <div className="comments-section">
      <button className="toggle" onClick={() => setOpen(o => !o)}>
        {open ? 'Hide Comments' : `Comments (${post.comments ? post.comments.length : 0})`}
      </button>
      {open && (
        <div className="comments-body">
          <ul>
            {(post.comments || []).map((c, idx) => (
              <li key={idx}><strong>{c.pseudonym || 'Anon'}:</strong> {c.content}</li>
            ))}
          </ul>
          <form onSubmit={(e) => { e.preventDefault(); onAdd(post._id, text); setText(''); }}>
            <input
              type="text"
              placeholder="Add a comment"
              value={text}
              onChange={e => setText(e.target.value)}
            />
            <button type="submit" disabled={!text.trim()}>Send</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostsTab;
