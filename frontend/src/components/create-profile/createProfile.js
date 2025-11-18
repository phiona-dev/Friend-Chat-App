import React, { useState } from 'react';
import './createProfile.css';
import { useNavigate } from 'react-router-dom';

const INTERESTS = [
  "Art & Design", "Coding & Tech", "Sports", "Gaming", "Music", "Literature",
  "Science", "Business", "Volunteering", "Photography", "Travel", "Food & Cooking",
  "Fashion", "Film & TV", "Debate", "Entreprenuership"
];

export default function CreateProfilePage() {
  const [pseudonym, setPseudonym] = useState('');
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const toggleInterest = (interest) => {
    setSelected(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pseudonym.trim()) {
      setError('Please enter a pseudonym');
      return;
    }
    if (selected.length === 0) {
      setError('Please select at least one interest');
      return;
    }
    // Save to localStorage (or send to backend)
    const profile = { pseudonym, interests: selected };
    localStorage.setItem('currentUserProfile', JSON.stringify(profile));
    navigate('/profile');
  };

  return (
    <div className="create-profile-page">
      <h2>Create Profile</h2>
      <form onSubmit={handleSubmit}>
        <label>
          <span>Choose Your Pseudonym</span>
          <input
            type="text"
            placeholder="e.g. StarGazer, CampusHero"
            value={pseudonym}
            onChange={e => setPseudonym(e.target.value)}
          />
        </label>
        <div className="hint">
          This name will be how others see you. Choose something fun and anonymous.
        </div>
        <label>
          <span>What are your interests?</span>
          <div className="interests-list">
            {INTERESTS.map(interest => (
              <button
                type="button"
                key={interest}
                className={selected.includes(interest) ? 'selected' : ''}
                onClick={() => toggleInterest(interest)}
              >
                {interest}
              </button>
            ))}
          </div>
        </label>
        <div className="why-anonymity">
          <h4>Why Anonymity?</h4>
          <p>
            Friend Chat App values your privacy. Pseudonyms allow you to interact freely and authentically without revealing your identity. Build connections based on shared interests and conversations, not social biases. Your privacy is our priority.
          </p>
        </div>
        {error && <div className="error">{error}</div>}
        <button className="complete-btn" type="submit">Complete Profile</button>
      </form>
    </div>
  );
}