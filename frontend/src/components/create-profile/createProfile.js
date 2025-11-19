import React, { useState } from 'react';
import './createProfile.css';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../Services/api';

const INTERESTS = [
  "Art & Design", "Coding & Tech", "Sports", "Gaming", "Music", "Literature",
  "Science", "Business", "Volunteering", "Photography", "Travel", "Food & Cooking",
  "Fashion", "Film & TV", "Debate", "Entrepreneurship"
];

export default function CreateProfilePage() {
  const [pseudonym, setPseudonym] = useState('');
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const toggleInterest = (interest) => {
    setSelected(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!pseudonym.trim()) {
      setError('Please enter a pseudonym');
      return;
    }
    if (selected.length === 0) {
      setError('Please select at least one interest');
      return;
    }

    setLoading(true);
    try {
      const userId = 'user1'; // Use actual authenticated user ID
      await userAPI.createProfile({
        userId,
        pseudonym,
        interests: selected,
      });

      // Save to localStorage
      localStorage.setItem('currentUserProfile', JSON.stringify({
        userId,
        pseudonym,
        interests: selected,
      }));

      navigate('/profile');
    } catch (err) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-profile-page">
      <div className="create-profile-container">
        <h1>Create Profile</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <span className="label-title">Choose Your Pseudonym</span>
              <p className="label-hint">e.g. StarGazer, CampusHero</p>
              <input
                type="text"
                placeholder="Enter a fun, anonymous name"
                value={pseudonym}
                onChange={e => setPseudonym(e.target.value)}
                disabled={loading}
              />
            </label>
            <p className="explanation">
              This name will be how others see you. Choose something fun and anonymous.
            </p>
          </div>

          <div className="form-group">
            <label>
              <span className="label-title">What are your interests?</span>
              <p className="label-hint">Select topics you're passionate about</p>
            </label>
            <div className="interests-list">
              {INTERESTS.map(interest => (
                <button
                  type="button"
                  key={interest}
                  className={`interest-btn ${selected.includes(interest) ? 'selected' : ''}`}
                  onClick={() => toggleInterest(interest)}
                  disabled={loading}
                >
                  {interest}
                </button>
              ))}
            </div>
            <p className="explanation">
              Select topics you're passionate about to connect with like-minded students.
            </p>
          </div>

          <div className="why-anonymity">
            <h3>Why Anonymity?</h3>
            <p>
              Friend Chat App values your privacy. Pseudonyms allow you to interact freely and authentically without revealing your identity. Build connections based on shared interests and conversations, not social biases. <strong>Your privacy is our priority.</strong>
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}
          
          <button 
            className="complete-btn" 
            type="submit"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}