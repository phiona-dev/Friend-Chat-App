import React, { useEffect, useState } from 'react';
import './profilePage.css';
import { userAPI } from '../../Services/api';

const STORAGE_KEY = 'currentUserProfile';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    userId: 'user1',
    pseudonym: 'You',
    email: '',
    about: '',
    interests: [],
    avatar: '/avatars/user1.jpg'
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Load profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Try loading from backend first
        const userId = 'user1'; // Use actual user ID
        const data = await userAPI.getProfile(userId);
        setProfile(data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (err) {
        console.log('Loading from localStorage...');
        // Fall back to localStorage
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            setProfile(JSON.parse(saved));
          }
        } catch (e) {
          console.error('Failed to load profile', e);
        }
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  // Clear message after 2.5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 2500);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleChange = (field) => (e) => {
    setProfile(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleInterestToggle = (interest) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfile(prev => ({ ...prev, avatar: event.target.result }));
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Failed to read avatar', err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to backend
      await userAPI.createProfile(profile);
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      setMessage('Profile saved successfully');
    } catch (err) {
      console.error('Save failed', err);
      setMessage('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1>My Profile</h1>

        {/* Avatar Section */}
        <div className="avatar-section">
          <div className="avatar-frame">
            {profile.avatar ? (
              <img src={profile.avatar} alt="avatar" className="avatar-img" />
            ) : (
              <div className="avatar-placeholder">
                {(profile.pseudonym || 'U').slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <label className="avatar-upload">
            <input type="file" accept="image/*" onChange={handleAvatarChange} />
            Change Avatar
          </label>
        </div>

        {/* Profile Fields */}
        <div className="profile-fields">
          <div className="field-group">
            <label>Display Name (Pseudonym)</label>
            <input
              type="text"
              value={profile.pseudonym}
              onChange={handleChange('pseudonym')}
              placeholder="Your pseudonym"
            />
          </div>

          <div className="field-group">
            <label>Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={handleChange('email')}
              placeholder="your.email@example.com"
            />
          </div>

          <div className="field-group">
            <label>About</label>
            <textarea
              value={profile.about}
              onChange={handleChange('about')}
              placeholder="Tell us about yourself"
              rows="4"
            />
          </div>

          <div className="field-group">
            <label>Interests</label>
            <div className="interests-grid">
              {['Art & Design', 'Coding & Tech', 'Sports', 'Gaming', 'Music', 'Literature',
                'Science', 'Business', 'Volunteering', 'Photography', 'Travel', 'Food & Cooking',
                'Fashion', 'Film & TV', 'Debate', 'Entrepreneurship'].map(interest => (
                <button
                  key={interest}
                  className={`interest-tag ${profile.interests.includes(interest) ? 'selected' : ''}`}
                  onClick={() => handleInterestToggle(interest)}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <div className="actions">
            <button className="save-btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
            {message && <span className="message">{message}</span>}
          </div>
        </div>

        {/* Activity Section */}
        <div className="activity-section">
          <h3>Your Activity</h3>
          <p className="muted">Recent chats and interactions will appear here.</p>
        </div>
      </div>
    </div>
  );
}