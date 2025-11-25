import React from 'react';
import ChatPage from './pages/ChatPage';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LostFoundList from './components/lostfound/LostFoundList';
import LostFoundForm from './components/lostfound/LostFoundForm';
import LostFoundDetail from './components/lostfound/LostFoundDetail';
import VerificationPage from './components/login/verification';
import Welcomepage from './components/login/welcomepage';
import LoginPage from './components/login/login';
import CreateProfilePage from './components/create-profile/createProfile';
import ProfilePage from './components/create-profile/profilePage';
import MatchingPage from './components/match/match';
import WelcomeBackPage from './components/login/WelcomeBackPage';

  
function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh' }}>
        <Routes>
          <Route path="/chats" element={<ChatPage />} />
          <Route path="/" element={<Welcomepage/>}/>
          <Route path="/login" element={<LoginPage/>}/>
          <Route path="/verify" element={<VerificationPage/>}/>
          <Route path="/welcome-back" element={<WelcomeBackPage />} />
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
  
