import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';

export default function LostFoundForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ status: 'lost', category: 'other' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function update(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/lostfound`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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

          <div>
            <label>Image URL (optional)</label>
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={form.imageUrl || ''}
              onChange={(e) => update('imageUrl', e.target.value)}
            />
            <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginTop: '0.375rem', marginBottom: 0 }}>
              Provide a direct link to an image of the item
            </p>
          </div>

          <div style={{
            padding: '1.5rem',
            background: 'var(--gray-50)',
            borderRadius: 'var(--radius)',
            border: '1px dashed var(--gray-300)'
          }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-900)', marginTop: 0, marginBottom: '1rem' }}>
              Contact Information (Optional)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label>Pseudonym</label>
                <input
                  placeholder="Your nickname"
                  value={form.reporterName || ''}
                  onChange={(e) => update('reporterName', e.target.value)}
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
