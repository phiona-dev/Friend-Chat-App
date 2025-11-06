import React, { useState } from 'react';
import './App.css';

const MobileAppDemo = () => {
  const [activeTab, setActiveTab] = useState('chats');

  return (
    <div className="mobile-app">
      {/* Header */}
      <div className="mobile-header">
        <h1>Friend Chat</h1>
      </div>

      {/* Content Area */}
      <div className="mobile-content">
        {activeTab === 'chats' && <div>Chat List Here</div>}
        {activeTab === 'match' && <div>Matching Interface</div>}
        {activeTab === 'home' && <div>Home Feed</div>}
        {activeTab === 'lostfound' && <div>Lost & Found</div>}
        {activeTab === 'profile' && <div>Profile Page</div>}
      </div>

      {/* Bottom Navigation - JUST LIKE MOBILE APP */}
      <div className="bottom-nav">
        {['chats', 'match', 'home', 'lostfound', 'profile'].map(tab => (
          <div 
            key={tab}
            className={`nav-item ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            <span className="nav-icon">
              {tab === 'chats' && '💬'}
              {tab === 'match' && '👥'} 
              {tab === 'home' && '🏠'}
              {tab === 'lostfound' && '🔍'}
              {tab === 'profile' && '👤'}
            </span>
            <span className="nav-label">{tab}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobileAppDemo;