import React from 'react';
import NavBar from './NavBar';
import '../layout/Layout.css';
import RightSidebar from '../sidebar/RightSidebar';

export default function Layout({ children }) {
  const profile = JSON.parse(localStorage.getItem('currentUserProfile') || 'null');
  return (
    <div className="app-shell">
      <NavBar />
      <div className="shell-main">
        <div className="shell-columns">
          <aside className="shell-left-nav" aria-label="Primary navigation">
            <NavBar variant="sidebar" />
          </aside>
          <main className="shell-center-content">
            {children}
          </main>
          {profile && profile.userId && (
            <aside className="shell-right-sidebar" aria-label="Highlights">
              <RightSidebar />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}