import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';

export default function LostFoundForm() {
  const navigate = useNavigate();
  
  // Get current user info
  const currentUserProfile = JSON.parse(localStorage.getItem('currentUserProfile') || '{}');
  
  const [form, setForm] = useState({ 
    status: 'lost', 
    category: 'other',
    reporterName: currentUserProfile.pseudonym || '',
    reporterEmail: currentUserProfile.email || '',
    reporterId: currentUserProfile.userId || 'unknown'
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(''); // For showing image preview
  const [imageFile, setImageFile] = useState(null); // Store the actual file

  function update(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    update('imageUrl', ''); // Clear any existing URL
  };

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Append all form fields
      Object.keys(form).forEach(key => {
        if (form[key]) {
          formData.append(key, form[key]);
        }
      });

      // Append image file if selected
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await fetch(`${API_BASE}/lostfound`, {
        method: 'POST',
        body: formData, // Use FormData instead of JSON
        // Don't set Content-Type header - browser will set it with boundary
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit');
      navigate(`/lostfound/${data._id}`);
      
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: '720px', margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{
        background: 'white',
        borderRadius: 'var(--radius-lg)',
        padding: '2.5rem',
        boxShadow: 'var(--shadow-xl)'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: 'var(--gray-900)',
            marginBottom: '0.5rem'
          }}>Report Lost/Found Item</h2>
          <p style={{ color: 'var(--gray-600)', margin: 0 }}>
            Help reunite items with their owners by providing details below.
          </p>
        </div>

        {error && (
          <div style={{
            padding: '1rem',
            marginBottom: '1.5rem',
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            borderRadius: 'var(--radius)',
            color: '#991b1b',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-start'
          }}>
            <span style={{ fontSize: '1.25rem' }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={onSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
          <div>
            <label>Item Title *</label>
            <input
              required
              placeholder="e.g., Black Wallet"
              value={form.title || ''}
              onChange={(e) => update('title', e.target.value)}
            />
          </div>

          <div>
            <label>Description *</label>
            <textarea
              required
              rows={4}
              placeholder="Describe the item, including color, brand, distinguishing features..."
              value={form.description || ''}
              onChange={(e) => update('description', e.target.value)}
              style={{ resize: 'vertical', minHeight: '100px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label>Category</label>
              <select value={form.category} onChange={(e) => update('category', e.target.value)}>
                {['id','phone','keys','book','laptop','bag','clothing','other'].map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Status</label>
              <select value={form.status} onChange={(e) => update('status', e.target.value)}>
                <option value="lost">🔴 Lost</option>
                <option value="found">🟢 Found</option>
              </select>
            </div>
          </div>

          <div>
            <label>Location</label>
            <input
              placeholder="e.g., Library, Cafeteria, Parking Lot A"
              value={form.location || ''}
              onChange={(e) => update('location', e.target.value)}
            />
          </div>

          {/* UPDATED IMAGE UPLOAD SECTION */}
          <div>
            <label>Item Image (optional)</label>
            
            {/* Image Preview */}
            {imagePreview && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  position: 'relative',
                  display: 'inline-block'
                }}>
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    style={{
                      maxWidth: '200px',
                      maxHeight: '200px',
                      borderRadius: 'var(--radius)',
                      border: '2px solid var(--gray-200)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* File Input */}
            <div style={{
              border: '2px dashed var(--gray-300)',
              borderRadius: 'var(--radius)',
              padding: '2rem',
              textAlign: 'center',
              background: imageFile ? 'var(--gray-50)' : 'white',
              transition: 'all 0.2s'
            }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
                id="image-upload"
              />
              <label 
                htmlFor="image-upload"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '2rem' }}>📷</div>
                <div>
                  <span style={{ 
                    color: 'var(--primary)', 
                    fontWeight: 600,
                    textDecoration: 'underline'
                  }}>
                    Click to upload
                  </span>
                  <span style={{ color: 'var(--gray-600)' }}> or drag and drop</span>
                </div>
                <p style={{ 
                  fontSize: '0.8125rem', 
                  color: 'var(--gray-500)', 
                  margin: 0 
                }}>
                  PNG, JPG, JPEG up to 5MB
                </p>
              </label>
            </div>

            {/* Fallback URL input (optional) */}
            <div style={{ marginTop: '1rem' }}>
              <label style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                Or provide image URL:
              </label>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={form.imageUrl || ''}
                onChange={(e) => update('imageUrl', e.target.value)}
                style={{ marginTop: '0.25rem' }}
              />
            </div>
          </div>

          <div style={{
            padding: '1.5rem',
            background: 'var(--gray-50)',
            borderRadius: 'var(--radius)',
            border: '1px dashed var(--gray-300)'
          }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-900)', marginTop: 0, marginBottom: '1rem' }}>
              Contact Information
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '1rem' }}>
              This information will be used for people to contact you about this item.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label>Your Name</label>
                <input
                  placeholder="Your name or pseudonym"
                  value={form.reporterName || ''}
                  onChange={(e) => update('reporterName', e.target.value)}
                  required
                />
              </div>
              <div>
                <label>USIU Email</label>
                <input
                  type="email"
                  placeholder="you@usiu.ac.ke"
                  value={form.reporterEmail || ''}
                  onChange={(e) => update('reporterEmail', e.target.value)}
                />
              </div>
            </div>
            
            {!currentUserProfile.userId && (
              <div style={{
                marginTop: '0.75rem',
                padding: '0.75rem',
                background: '#fef3cd',
                border: '1px solid #f59e0b',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.875rem',
                color: '#92400e'
              }}>
                ⚠️ You are not logged in. The contact feature may not work properly.
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem' }}>
            <button
              type="button"
              onClick={() => window.history.back()}
              style={{
                flex: 1,
                background: 'var(--gray-200)',
                color: 'var(--gray-700)'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{ flex: 2 }}
            >
              {submitting ? 'Submitting...' : '✅ Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}