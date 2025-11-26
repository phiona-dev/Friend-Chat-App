import React, { useState } from "react";
import "./Posts.css";

const sampleAvatars = [
  "https://i.pravatar.cc/55?img=1",
  "https://i.pravatar.cc/55?img=2",
  "https://i.pravatar.cc/55?img=3",
  "https://i.pravatar.cc/55?img=4",
];

const randomNames = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank"];

const randomCommentsPool = [
  "Can't wait for the club meeting! 😄",
  "Who else is joining the anime marathon? 🎌",
  "This is so exciting! 🙌",
  "I'll bring snacks 🍿",
  "Love this idea! 😍",
  "Do we need to bring anything?",
  "I'll take photos for everyone! 📸",
  "Wow, amazing project! 🔥",
  "I'm in! Let's do it!",
  "Can someone explain the rules? 🤔",
  "One Piece is the best manga! 🏴‍☠️",
  "Count me in for the study group! 📚",
  "This looks fun! 😎"
];

const mockPosts = [
  {
    id: 101,
    user: "Alice",
    avatar: sampleAvatars[0],
    text: "Welcome to our first school social feed! #Welcome #SchoolLife",
    time: "09:00 AM",
    likes: 8,
    liked: false,
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=700&q=80",
    category: "Featured",
    likeNames: ["Bob", "Charlie", "Diana"],
    comments: [
      { user: "Bob", text: "Excited to join! 🎉", time: "09:05 AM" },
      { user: "Charlie", text: "Can't wait to meet everyone!", time: "09:07 AM" },
      { user: "Diana", text: "This is going to be so fun! 😄", time: "09:10 AM" }
    ],
    showComments: false
  },
  {
    id: 102,
    user: "Bob",
    avatar: sampleAvatars[1],
    text: "Anyone going to the #Anime club meeting today? 🎌",
    time: "10:30 AM",
    likes: 5,
    liked: false,
    image: null,
    category: "Anime Club",
    likeNames: ["Alice", "Diana"],
    comments: [
      { user: "Alice", text: "I'll be there! 🙌", time: "10:32 AM" },
      { user: "Charlie", text: "What time does it start? 🕒", time: "10:34 AM" },
      { user: "Diana", text: "I’ll bring snacks 🍿", time: "10:35 AM" }
    ],
    showComments: false
  },
  {
    id: 103,
    user: "Charlie",
    avatar: sampleAvatars[2],
    text: "Just finished my science project on #RenewableEnergy 🌱",
    time: "09:45 AM",
    likes: 3,
    liked: false,
    image: "https://images.unsplash.com/photo-1593642532973-d31b6557fa68?auto=format&fit=crop&w=700&q=80",
    category: "Science Club",
    likeNames: ["Eve"],
    comments: [
      { user: "Eve", text: "Amazing work! 🔥", time: "09:50 AM" },
      { user: "Bob", text: "Can you show me the experiment results?", time: "09:55 AM" },
      { user: "Alice", text: "Love seeing science in action! 🤓", time: "10:00 AM" }
    ],
    showComments: false
  },
  {
    id: 104,
    user: "Diana",
    avatar: sampleAvatars[3],
    text: "Who wants to join the #Photography club this Friday? 📸",
    time: "08:20 AM",
    likes: 2,
    liked: false,
    image: null,
    category: "Photography",
    likeNames: [],
    comments: [
      { user: "Charlie", text: "I'm in! Can't wait to take photos 📷", time: "08:25 AM" },
      { user: "Bob", text: "Do we need our own cameras?", time: "08:28 AM" },
      { user: "Eve", text: "I'll bring my DSLR 😎", time: "08:30 AM" }
    ],
    showComments: false
  },
  {
    id: 105,
    user: "Frank",
    avatar: sampleAvatars[0],
    text: "Anyone wants to do a #Manga reading club after school? 📚",
    time: "11:00 AM",
    likes: 4,
    liked: false,
    image: null,
    category: "Manga Club",
    likeNames: ["Alice", "Charlie"],
    comments: [
      { user: "Alice", text: "Yes! Let's meet at the library.", time: "11:05 AM" },
      { user: "Diana", text: "I love manga 😍", time: "11:10 AM" },
      { user: "Bob", text: "Can we start with One Piece? 🏴‍☠️", time: "11:15 AM" }
    ],
    showComments: false
  }
];

// Random comments generator
const generateRandomComments = () => {
  const count = Math.floor(Math.random() * 3) + 2; // 2-4 comments
  let comments = [];
  for (let i = 0; i < count; i++) {
    const text = randomCommentsPool[Math.floor(Math.random() * randomCommentsPool.length)];
    const user = randomNames[Math.floor(Math.random() * randomNames.length)];
    const time = new Date(Date.now() - Math.floor(Math.random() * 3600000))
      .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    comments.push({ user, text, time });
  }
  return comments;
};

const Posts = () => {
  const [posts, setPosts] = useState(mockPosts.map(post => ({
    ...post,
    comments: [...post.comments, ...generateRandomComments()]
  })));
  const [userName, setUserName] = useState("Your Name");
  const [avatar, setAvatar] = useState(sampleAvatars[0]);
  const [textInput, setTextInput] = useState("");
  const [image, setImage] = useState(null);
  const [editId, setEditId] = useState(null);
  const [theme, setTheme] = useState("light");
  const [commentInputs, setCommentInputs] = useState({});

  const addPost = () => {
    if (!textInput.trim() && !image) return;
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newPost = {
      id: Date.now(),
      user: userName || "Anonymous",
      avatar,
      text: textInput,
      time: timestamp,
      likes: 0,
      liked: false,
      image,
      likeNames: [],
      comments: [],
      showComments: false,
      category: "General"
    };

    if (editId !== null) {
      setPosts(posts.map(p => p.id === editId ? { ...p, text: textInput, image, time: timestamp } : p));
      setEditId(null);
    } else {
      setPosts([newPost, ...posts]);
    }

    setTextInput("");
    setImage(null);
  };

  const editPost = (id) => {
    const post = posts.find(p => p.id === id);
    setTextInput(post.text);
    setImage(post.image || null);
    setEditId(id);
  };

  const deletePost = (id) => setPosts(posts.filter(p => p.id !== id));

  const likePost = (id) => {
    setPosts(posts.map(p => {
      if (p.id === id) {
        const newLikeNames = [...p.likeNames, randomNames[Math.floor(Math.random() * randomNames.length)]];
        return { ...p, likes: p.likes + 1, liked: true, likeNames: newLikeNames };
      }
      return p;
    }));
    setTimeout(() => {
      setPosts(posts.map(p => p.id === id ? { ...p, liked: false } : p));
    }, 300);
  };

  const toggleComments = (id) => {
    setPosts(posts.map(p => p.id === id ? { ...p, showComments: !p.showComments } : p));
  };

  const addComment = (postId) => {
    const commentText = commentInputs[postId]?.trim();
    if (!commentText) return;
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setPosts(posts.map(p => p.id === postId ? {
      ...p,
      comments: [...p.comments, { user: userName || "Anonymous", text: commentText, time: timestamp }]
    } : p));
    setCommentInputs({ ...commentInputs, [postId]: "" });
  };

  const handleCommentChange = (postId, value) => {
    setCommentInputs({ ...commentInputs, [postId]: value });
  };

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result);
      reader.readAsDataURL(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => e.preventDefault();
  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <div className={`posts-container ${theme}`}>
      <h2>School Social Feed</h2>
      <div className="post-count">Total Posts: {posts.length}</div>
      <button className="theme-btn" onClick={toggleTheme}>
        Switch to {theme === "light" ? "Dark" : "Light"} Mode
      </button>

      <div className="profile-section">
        <input type="text" value={userName} placeholder="Enter your name" onChange={(e) => setUserName(e.target.value)} />
        <select value={avatar} onChange={(e) => setAvatar(e.target.value)}>
          {sampleAvatars.map((a, i) => <option key={i} value={a}>Avatar {i + 1}</option>)}
        </select>
      </div>

      <div className="input-section" onDrop={handleDrop} onDragOver={handleDragOver}>
        <input type="text" value={textInput} placeholder="What's happening?" onChange={(e) => setTextInput(e.target.value)} />
        <label className="upload-btn">
          <span>📷 Upload</span>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </label>
        <button onClick={addPost}>{editId !== null ? "Update" : "Post"}</button>
      </div>

      <div className="posts-list">
        {posts.map((post) => (
          <div key={post.id} className={`post-card`}>
            {post.category === "Featured" && <div className="featured-badge">FEATURED</div>}
            {post.category && post.category !== "Featured" && <div className="category-badge">[{post.category}]</div>}

            <div className="post-header">
              <img src={post.avatar} alt={post.user} className="avatar" />
              <span className="post-user">{post.user}</span>
              <span className="timestamp">{post.time}</span>
            </div>

            <div className="post-text">
              {post.text.split(" ").map((word, i) => word.startsWith("#") ? <span key={i} className="hashtag">{word} </span> : word + " ")}
            </div>

            {post.image && <img src={post.image} alt="uploaded" className="post-image" />}

            <div className="post-footer">
              <button className={`like-btn ${post.liked ? "liked" : ""}`} onClick={() => likePost(post.id)} title={post.likeNames.length > 0 ? `Liked by ${post.likeNames.join(", ")}` : ""}>
                ❤️ {post.likes}
              </button>
              <button onClick={() => editPost(post.id)}>Edit</button>
              <button onClick={() => deletePost(post.id)}>Delete</button>
              <button onClick={() => toggleComments(post.id)}>
                {post.showComments ? "Hide Comments" : `Comments (${post.comments.length})`}
              </button>
            </div>

            {post.showComments && (
              <div className="comments-section">
                {post.comments.map((c, i) => (
                  <div key={i} className="comment">
                    <span className="comment-user">{c.user}:</span> {c.text} <span className="comment-time">{c.time}</span>
                  </div>
                ))}
                <div className="add-comment">
                  <input
                    type="text"
                    value={commentInputs[post.id] || ""}
                    placeholder="Add a comment..."
                    onChange={(e) => handleCommentChange(post.id, e.target.value)}
                  />
                  <button onClick={() => addComment(post.id)}>Comment</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Posts;
