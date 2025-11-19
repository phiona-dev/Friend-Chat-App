// src/App.js
import React from 'react';
import ChatPage from './pages/ChatPage';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LostFoundList from './pages/lostfound/LostFoundList';
import LostFoundForm from './pages/lostfound/LostFoundForm';
import LostFoundDetail from './pages/lostfound/LostFoundDetail';
import VerificationPage from './components/login/verification';
import Welcomepage from './components/login/welcomepage';
import LoginPage from './components/login/login';
import CreateProfilePage from './components/create-profile/createProfile';
import ProfilePage from './components/create-profile/profilePage';
import MatchingPage from './components/match/match';
import StartupRedirect from './components/auth/StartupRedirect';
  
function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh' }}>
        <StartupRedirect/>
        <Routes>
          {/*<Route path="/" element={<HomePage />} />*/}
          <Route path="/chats" element={<ChatPage />} />
          <Route path="/" element={<Welcomepage/>}/>
          <Route path="/login" element={<LoginPage/>}/>
          <Route path="/verify" element={<VerificationPage/>}/>
          <Route path="/create-profile" element={<CreateProfilePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/matching" element={<MatchingPage />} />
          <Route path="/lost-found" element={<LostFoundList />} />
          <Route path="/lostfound/new" element={<LostFoundForm />} />
          <Route path="/lostfound/:id" element={<LostFoundDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
  
