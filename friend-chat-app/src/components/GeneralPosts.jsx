import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles/GeneralPosts.css";

const GeneralPosts = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  const apiUrl = "http://localhost:5000/posts"; // replace with your backend

  const fetchPosts = async () => {
    const res = await axios.get(apiUrl);
    setPosts(res.data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const addPost = async () => {
    if (!newPost.trim()) return;
    const res = await axios.post(apiUrl, { content: newPost, user: "User" });
    setPosts([res.data, ...posts]);
    setNewPost("");
  };

  const deletePost = async (id) => {
    await axios.delete(`${apiUrl}/${id}`);
    setPosts(posts.filter((p) => p._id !== id));
  };

  const updatePost = async (id) => {
    await axios.put(`${apiUrl}/${id}`, { content: editingContent });
    setPosts(posts.map((p) => (p._id === id ? { ...p, content: editingContent } : p)));
    setEditingId(null);
    setEditingContent("");
  };

  return (
    <div className="general-posts-container">
      <textarea
        placeholder="Write a new post..."
        value={newPost}
        onChange={(e) => setNewPost(e.target.value)}
      />
      <button onClick={addPost}>Post</button>

      {posts.map((p) => (
        <div key={p._id} className="post-card">
          <strong>{p.user}</strong>
          {editingId === p._id ? (
            <>
              <textarea value={editingContent} onChange={(e) => setEditingContent(e.target.value)} />
              <button onClick={() => updatePost(p._id)}>Save</button>
              <button onClick={() => setEditingId(null)}>Cancel</button>
            </>
          ) : (
            <>
              <p>{p.content}</p>
              <button onClick={() => { setEditingId(p._id); setEditingContent(p.content); }}>Edit</button>
              <button onClick={() => deletePost(p._id)}>Delete</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default GeneralPosts;
