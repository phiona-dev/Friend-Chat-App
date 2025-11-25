// src/App.js
import React from 'react';
import ChatPage from './pages/ChatPage';
import './App.css';
import './styles/theme.css';
import Layout from './components/layout/Layout';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LostFoundList from './components/lostfound/LostFoundList';
import LostFoundForm from './components/lostfound/LostFoundForm';
import LostFoundDetail from './components/lostfound/LostFoundDetail';
import VerificationPage from './components/login/verification';
import Welcomepage from './components/login/welcomepage';
import LoginPage from './components/login/login';
import QuickLogin from './components/login/QuickLogin';
import CreateProfilePage from './components/create-profile/createProfile';
import ProfilePage from './components/create-profile/profilePage';
import MatchingPage from './components/match/match';
import GeneralPostsFeed from './components/posts/GeneralPostsFeed';
import ProtectedRoute from './components/auth/ProtectedRoute';
import TopLoadingBar from './components/common/TopLoadingBar';
import { subscribeLoader, startLoader, finishLoader, forceFinishAll } from './utils/loaderManager';

function AppShell() {
  const location = useLocation();
  const [routeLoading, setRouteLoading] = React.useState(false);

  React.useEffect(() => {
    // Subscribe to global loader manager
    const unsubscribe = subscribeLoader(setRouteLoading);
    return unsubscribe;
  }, []);

  React.useEffect(() => {
    // On every route change, schedule a single loader cycle
    startLoader();
    const timeout = setTimeout(() => {
      finishLoader();
    }, 900);
    return () => clearTimeout(timeout);
  }, [location.key]);

  React.useEffect(() => {
    // Expose a dev helper to force-finish the loader when debugging stuck states
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-undef
      window.forceFinishLoader = forceFinishAll;
    }
    return () => {
      if (process.env.NODE_ENV !== 'production') {
        try { delete window.forceFinishLoader; } catch (e) {}
      }
    };
  }, []);

  return (
    <>
      <TopLoadingBar loading={routeLoading} />
      <Routes>
        {/* Public routes (rendered without the app chrome) */}
        <Route path='/welcome' element={<Welcomepage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/quick-login' element={<QuickLogin />} />
        <Route path='/verify' element={<VerificationPage />} />
        <Route path='/create-profile' element={<CreateProfilePage />} />

        {/* All protected routes are wrapped with the app Layout so nav/sidebar are only visible when inside Layout */}
        <Route path='/' element={<Layout>
            <ProtectedRoute>
              <GeneralPostsFeed />
            </ProtectedRoute>
          </Layout>} />

        <Route path='/posts' element={<Navigate to="/" replace />} />

        <Route path='/chats' element={<Layout>
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          </Layout>} />

        <Route path='/profile' element={<Layout>
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          </Layout>} />

        <Route path='/matching' element={<Layout>
            <ProtectedRoute>
              <MatchingPage />
            </ProtectedRoute>
          </Layout>} />

        <Route path='/lost-found' element={<Layout>
            <ProtectedRoute>
              <LostFoundList />
            </ProtectedRoute>
          </Layout>} />

        <Route path='/lostfound/new' element={<Layout>
            <ProtectedRoute>
              <LostFoundForm />
            </ProtectedRoute>
          </Layout>} />

        <Route path='/lostfound/:id' element={<Layout>
            <ProtectedRoute>
              <LostFoundDetail />
            </ProtectedRoute>
          </Layout>} />
      </Routes>
    </>
  );
}
  
function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
  
