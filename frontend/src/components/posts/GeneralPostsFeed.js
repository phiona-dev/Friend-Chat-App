import React, { useEffect, useState, useRef } from 'react';
import { postsAPI } from '../../Services/api';
import { IMAGE_BASE } from '../../config';
import './GeneralPostsFeed.css';
import HomeBannerSlider from './HomeBannerSlider';
import Skeleton from '../common/Skeleton';

const CATEGORIES = ['All','Memes','Events','Questions','Announcements','General'];

export default function GeneralPostsFeed() {
  const profile = JSON.parse(localStorage.getItem('currentUserProfile') || '{}');
  const userId = profile.userId || 'user1';
  const pseudonym = profile.pseudonym || 'Anon';

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [showComposer, setShowComposer] = useState(false);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [postCategory, setPostCategory] = useState('General');
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const observerRef = useRef();

  const resetComposer = () => {
    setContent('');
    setTitle('');
    setTags('');
    setPostCategory('General');
    setImageFile(null);
  };

  const fetchPosts = async (reset=false) => {
    if (loading) return;
    try {
      setLoading(true);
      const nextPage = reset ? 1 : page;
      const res = await postsAPI.list(nextPage, 15, search, undefined, category);
      const items = res.items || [];
      if (reset) {
        setPosts(items);
      } else {
        setPosts(prev => [...prev, ...items.filter(i => !prev.some(p => p._id === i._id))]);
      }
      setHasMore(items.length === 15); // crude hasMore check
      setPage(nextPage + 1);
    } catch (err) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(true); }, [category]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPosts(true);
  };

  const handleInfiniteScroll = (entries) => {
    const entry = entries[0];
    if (entry.isIntersecting && hasMore && !loading) {
      fetchPosts();
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(handleInfiniteScroll, { threshold: 1.0 });
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  });

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      let newPost;
      const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      if (imageFile) {
        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('pseudonym', pseudonym);
        formData.append('title', title.trim());
        formData.append('content', content.trim());
        formData.append('tags', tagArray.join(','));
        formData.append('category', postCategory);
        formData.append('image', imageFile);
        newPost = await postsAPI.createWithImage(formData);
      } else {
        newPost = await postsAPI.create({ userId, pseudonym, title: title.trim(), content: content.trim(), tags: tagArray, category: postCategory });
      }
      setPosts(prev => [newPost, ...prev]);
      resetComposer();
      setShowComposer(false);
    } catch (err) {
      setError('Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await postsAPI.toggleLike(postId, userId);
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, likes: res.likes } : p));
    } catch (err) { console.error('like failed'); }
  };

  const handleComment = async (postId, text) => {
    if (!text.trim()) return;
    try {
      const comment = await postsAPI.addComment(postId, { userId, pseudonym, content: text.trim() });
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, comments: [...p.comments, comment] } : p));
    } catch (err) { console.error('comment failed'); }
  };

  const handleReport = async (postId) => {
    const reason = prompt('Enter report reason (optional):') || 'unspecified';
    try {
      await postsAPI.report(postId, { userId, reason });
      alert('Post reported.');
    } catch (err) { alert('Failed to report post'); }
  };

  return (
    <div className="feed-container">
      {loading && posts.length === 0 ? (
        <div style={{ padding: '1rem 0' }}>
          <Skeleton height={160} rows={1} />
          <div style={{ height: 12 }} />
          <Skeleton width="30%" height={12} />
        </div>
      ) : (
        <HomeBannerSlider />
      )}
      <header className="feed-header">
        <h2>Campus Feed</h2>
        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        <button className="create-btn" onClick={() => setShowComposer(true)}>Create Post</button>
      </header>

      <nav className="category-tabs">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={cat === category ? 'active' : ''}
            onClick={() => { setCategory(cat); setPage(1); }}
          >{cat}</button>
        ))}
      </nav>

      {error && <div className="error-banner">{error}</div>}

      <main className="posts-feed">
        {loading && posts.length === 0 ? (
          <>
            {[1,2,3].map(i => (
              <div key={i} className="post-card" style={{ opacity: 0.9 }}>
                <div className="post-meta">
                  <span className="pseudonym"><Skeleton width={90} height={12} /></span>
                  <span className="dot">•</span>
                  <span className="time"><Skeleton width={60} height={12} /></span>
                </div>
                <div style={{ margin: '0.5rem 0' }}>
                  <Skeleton width="70%" height={18} />
                </div>
                <div className="post-content" style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <Skeleton rows={2} height={12} />
                  </div>
                  <div style={{ width: 120 }}>
                    <Skeleton width={120} height={80} />
                  </div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <Skeleton width="40%" height={12} />
                </div>
              </div>
            ))}
            <div ref={observerRef} style={{ height: 1 }} />
          </>
        ) : (
          posts.map(post => (
            <PostCard
              key={post._id}
              post={post}
              onLike={() => handleLike(post._id)}
              onComment={(text) => handleComment(post._id, text)}
              onReport={() => handleReport(post._id)}
            />
          ))
        )}
        <div ref={observerRef} style={{ height: 1 }} />
        {loading && posts.length > 0 && <div style={{ padding: '1rem 0' }}><Skeleton rows={1} height={14} /></div>}
        {!hasMore && posts.length > 0 && <div className="end">End of feed</div>}
      </main>

      {showComposer && (
        <div className="modal-overlay" onClick={() => !submitting && setShowComposer(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create Post</h3>
            <form onSubmit={handleCreatePost}>
              <label className="field">
                <span>Category</span>
                <select value={postCategory} onChange={(e) => setPostCategory(e.target.value)} disabled={submitting}>
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Title (optional)</span>
                <input value={title} onChange={(e) => setTitle(e.target.value)} disabled={submitting} />
              </label>
              <label className="field">
                <span>Content</span>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} disabled={submitting} />
              </label>
              <label className="field">
                <span>Tags (comma separated)</span>
                <input value={tags} onChange={(e) => setTags(e.target.value)} disabled={submitting} />
              </label>
              <label className="field">
                <span>Image (optional)</span>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} disabled={submitting} />
              </label>
              <div className="actions">
                <button type="button" onClick={() => !submitting && setShowComposer(false)}>Cancel</button>
                <button type="submit" disabled={submitting || !content.trim()}>{submitting ? 'Posting...' : 'Post'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function PostCard({ post, onLike, onComment, onReport }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const time = new Date(post.createdAt).toLocaleString();
  // Ensure imageUrl is absolute if needed
  let imageSrc = post.imageUrl;
  if (imageSrc && imageSrc.startsWith('/uploads')) {
    imageSrc = `${IMAGE_BASE}${imageSrc}`;
  }
  return (
    <article className="post-card">
      <div className="post-meta">
        <span className="pseudonym">{post.pseudonym || 'Anon'}</span>
        <span className="dot">•</span>
        <span className="time">{time}</span>
        <span className="dot">•</span>
        <span className="category-tag">{post.category || 'General'}</span>
      </div>
      {post.title && <h3 className="post-title">{post.title}</h3>}
      <div className="post-content">
        <p>{post.content}</p>
        {imageSrc && <img src={imageSrc} alt="post" className="post-image" />}
      </div>
      {post.tags && post.tags.length > 0 && (
        <div className="tags-row">{post.tags.map(t => <span key={t} className="tag">#{t}</span>)}</div>
      )}
      <div className="engagement">
        <button onClick={onLike}>❤️ {post.likes ? post.likes.length : 0}</button>
        <button onClick={() => setShowComments(s => !s)}>💬 {post.comments ? post.comments.length : 0}</button>
        <button onClick={onReport}>⚠️ Report</button>
      </div>
      {showComments && (
        <div className="comments-panel">
          <ul className="comments-list">
            {(post.comments || []).map((c,i) => (
              <li key={i}><strong>{c.pseudonym || 'Anon'}:</strong> {c.content}</li>
            ))}
          </ul>
          <form onSubmit={(e) => { e.preventDefault(); onComment(commentText); setCommentText(''); }} className="comment-form">
            <input
              type="text"
              placeholder="Add a comment"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button type="submit" disabled={!commentText.trim()}>Send</button>
          </form>
        </div>
      )}
    </article>
  );
}
