// src/App.js
import React from 'react';
import ChatPage from './pages/ChatPage';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LostFoundList from './pages/lostfound/LostFoundList';
import LostFoundForm from './pages/lostfound/LostFoundForm';
import LostFoundDetail from './pages/lostfound/LostFoundDetail';
  
function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh' }}>
        {/*<NavBar />*/}
        <Routes>
          {/*<Route path="/" element={<HomePage />} />*/}
          <Route path="/" element={<ChatPage />} />
          <Route path="/lost-found" element={<LostFoundList />} />
          <Route path="/lostfound/new" element={<LostFoundForm />} />
          <Route path="/lostfound/:id" element={<LostFoundDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
  
