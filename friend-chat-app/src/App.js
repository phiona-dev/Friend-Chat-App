import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Posts from "./components/Posts";
import "./App.css";

function App() {
  return (
    <Router>
      <div>
        <nav className="navbar">
          <Link to="/posts">Posts</Link>
        </nav>

        <Routes>
          <Route path="/posts" element={<Posts />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
