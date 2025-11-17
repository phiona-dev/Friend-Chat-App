import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';

export default function LostFoundDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

// Load item details
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/lostfound/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load');
        setItem(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function updateStatus(newStatus) {
    try {
      const res = await fetch(`${API_BASE}/lostfound/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update');
      setItem(data);
    } catch (e) {
      alert(e.message);
    }
  }

  if (loading) return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem', textAlign: 'center', color: 'white', fontSize: '1.125rem' }}>
      Loading item details...
    </div>
  );
  
  if (error) return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{
        background: 'white',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        boxShadow: 'var(--shadow-xl)',
        border: '2px solid var(--danger)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h3 style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}>Error Loading Item</h3>
        <p style={{ color: 'var(--gray-600)' }}>{error}</p>
        <button onClick={() => navigate(-1)} style={{ marginTop: '1rem' }}>← Go Back</button>
      </div>
    </div>
  );
  
  if (!item) return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{
        background: 'white',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        boxShadow: 'var(--shadow-xl)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
        <h3 style={{ color: 'var(--gray-900)', marginBottom: '0.5rem' }}>Item Not Found</h3>
        <p style={{ color: 'var(--gray-600)' }}>This item may have been removed or doesn't exist.</p>
        <button onClick={() => navigate(-1)} style={{ marginTop: '1rem' }}>← Go Back</button>
      </div>
    </div>
  );

  const statusColors = {
    lost: { bg: '#fef2f2', text: '#991b1b', border: '#fca5a5' },
    found: { bg: '#f0fdf4', text: '#166534', border: '#86efac' },
    claimed: { bg: '#f3f4f6', text: '#4b5563', border: '#d1d5db' }
  };
  const colors = statusColors[item.status] || statusColors.claimed;

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          marginBottom: '1.5rem',
          background: 'rgba(255, 255, 255, 0.9)',
          color: 'var(--gray-700)',
          backdropFilter: 'blur(10px)'
        }}
      >
        ← Back to List
      </button>

      <div style={{
        background: 'white',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xl)',
        overflow: 'hidden'
      }}>
        {item.imageUrl && (
          <div style={{
            width: '100%',
            height: '400px',
            background: `url(${item.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }} />
        )}

        <div style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <span style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.9375rem',
              fontWeight: 600,
              background: colors.bg,
              color: colors.text,
              border: `2px solid ${colors.border}`
            }}>
              {item.status.toUpperCase()}
            </span>
            <span style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.9375rem',
              fontWeight: 600,
              background: 'var(--gray-100)',
              color: 'var(--gray-700)'
            }}>
              {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
            </span>
            {item.location && (
              <span style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.9375rem',
                fontWeight: 500,
                background: 'var(--primary-light)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem'
              }}>
                📍 {item.location}
              </span>
            )}
          </div>

          <h1 style={{
            fontSize: '2.25rem',
            fontWeight: 700,
            color: 'var(--gray-900)',
            marginBottom: '1rem'
          }}>{item.title}</h1>

          <p style={{
            fontSize: '1.125rem',
            color: 'var(--gray-700)',
            lineHeight: 1.7,
            marginBottom: '2rem'
          }}>{item.description}</p>

          {(item.reporterName || item.reporterEmail) && (
            <div style={{
              padding: '1.25rem',
              background: 'var(--gray-50)',
              borderRadius: 'var(--radius)',
              marginBottom: '2rem',
              borderLeft: '4px solid var(--primary)'
            }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Reported By
              </h4>
              <div style={{ fontSize: '1rem', color: 'var(--gray-900)' }}>
                {item.reporterName && <div style={{ fontWeight: 600 }}>{item.reporterName}</div>}
                {item.reporterEmail && <div style={{ color: 'var(--gray-600)' }}>{item.reporterEmail}</div>}
              </div>
            </div>
          )}

          <div style={{
            borderTop: '1px solid var(--gray-200)',
            paddingTop: '1.5rem'
          }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '1rem' }}>
              Update Status
            </h4>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {['lost','found','claimed'].map(s => {
                const btnColors = statusColors[s];
                const isActive = item.status === s;
                return (
                  <button
                    key={s}
                    disabled={isActive}
                    onClick={() => updateStatus(s)}
                    style={{
                      background: isActive ? btnColors.bg : 'white',
                      color: isActive ? btnColors.text : 'var(--gray-700)',
                      border: `2px solid ${isActive ? btnColors.border : 'var(--gray-300)'}`,
                      fontWeight: 600,
                      opacity: isActive ? 1 : 0.7
                    }}
                  >
                    {isActive && '✓ '}
                    Mark as {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
