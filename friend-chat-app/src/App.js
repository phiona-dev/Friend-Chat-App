import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import UserProfile from "./components/UserProfile";
import GeneralPosts from "./components/GeneralPosts";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <UserProfile />
              <GeneralPosts />
            </div>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

