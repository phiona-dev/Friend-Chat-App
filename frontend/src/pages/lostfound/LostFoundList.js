import { useEffect, useState } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import Navbar from '../../components/navigation/bottom-navbar';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';

export default function LostFoundList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  const q = searchParams.get('q') || '';
  const status = searchParams.get('status') || '';
  const category = searchParams.get('category') || '';

  const location = useLocation();
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        if (q) params.set('q', q);
        if (status) params.set('status', status);
        if (category) params.set('category', category);
        const res = await fetch(`${API_BASE}/lostfound?${params.toString()}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load');
        setItems(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [q, status, category]);

  function onFilterChange(e) {
    const form = e.target.form || e.currentTarget;
    const next = new URLSearchParams(searchParams);
    next.set('q', form.q.value);
    next.set('status', form.status.value);
    next.set('category', form.category.value);
    setSearchParams(next);
  }

  const statusColors = {
    lost: { bg: '#fef2f2', text: '#991b1b', border: '#fca5a5' },
    found: { bg: '#f0fdf4', text: '#166534', border: '#86efac' },
    claimed: { bg: '#f3f4f6', text: '#4b5563', border: '#d1d5db' }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem' }}>
      <div style={{
        background: 'white',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        boxShadow: 'var(--shadow-xl)',
        marginBottom: '2rem'
      }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: 'var(--gray-900)',
          marginBottom: '0.5rem'
        }}>Lost & Found</h2>
        <Link to="/lostfound/new" style={{
          padding: '0.5rem 1.25rem',
          borderRadius: 'var(--radius)',
          fontWeight: 600,
          background: isActive('/lostfound/new') ? 'var(--primary)' : 'var(--primary-light)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          + Report Item
        </Link>
        <p style={{ color: 'var(--gray-600)', marginBottom: '1.5rem' }}>Report and track lost items on campus</p>

        
        <form onChange={onFilterChange} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input
            name="q"
            placeholder="🔍 Search items..."
            defaultValue={q}
            style={{ flex: '1 1 300px', minWidth: '200px' }}
          />
          <select name="status" defaultValue={status} style={{ flex: '0 1 auto', minWidth: '140px' }}>
            <option value="">All Status</option>
            <option value="lost">🔴 Lost</option>
            <option value="found">🟢 Found</option>
            <option value="claimed">⚪ Claimed</option>
          </select>
          <select name="category" defaultValue={category} style={{ flex: '0 1 auto', minWidth: '160px' }}>
            <option value="">All Categories</option>
            {['id','phone','keys','book','laptop','bag','clothing','other'].map(c => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </form>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'white', fontSize: '1.125rem' }}>
          Loading items...
        </div>
      )}
      {error && (
        <div style={{
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          color: 'var(--danger)',
          boxShadow: 'var(--shadow-lg)',
          border: '2px solid var(--danger)'
        }}>
          ⚠️ {error}
        </div>
      )}
      
      <div style={{ display: 'grid', gap: '1.25rem', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
        {items.map(item => {
          const colors = statusColors[item.status] || statusColors.claimed;
          return (
            <Link
              key={item._id}
              to={`/lostfound/${item._id}`}
              style={{
                display: 'block',
                background: 'white',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-md)',
                transition: 'all 0.3s',
                border: '1px solid var(--gray-200)',
                textDecoration: 'none',
                color: 'inherit'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
            >
              <div style={{ display: 'flex', gap: '1rem' }}>
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt="item"
                    style={{
                      width: '100px',
                      height: '100px',
                      objectFit: 'cover',
                      borderRadius: 'var(--radius)',
                      flexShrink: 0
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100px',
                    height: '100px',
                    background: '#667eea',
                    borderRadius: 'var(--radius)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    flexShrink: 0
                  }}>
                    📦
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{
                    margin: '0 0 0.5rem 0',
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    color: 'var(--gray-900)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>{item.title}</h3>
                  <p style={{
                    margin: '0 0 0.75rem 0',
                    color: 'var(--gray-600)',
                    fontSize: '0.9375rem',
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>{item.description}</p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{
                      padding: '0.25rem 0.625rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      background: colors.bg,
                      color: colors.text,
                      border: `1px solid ${colors.border}`
                    }}>
                      {item.status}
                    </span>
                    <span style={{
                      padding: '0.25rem 0.625rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      background: 'var(--gray-100)',
                      color: 'var(--gray-700)'
                    }}>
                      {item.category}
                    </span>
                    {item.location && (
                      <span style={{
                        fontSize: '0.8125rem',
                        color: 'var(--gray-500)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        📍 {item.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      
      {!loading && items.length === 0 && (
        <div style={{
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: '3rem',
          textAlign: 'center',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
            No items found
          </h3>
          <p style={{ color: 'var(--gray-600)', marginBottom: '1.5rem' }}>Try adjusting your search filters or be the first to report an item.</p>
          <Link to="/lostfound/new" style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            background: 'var(--primary)',
            color: 'white',
            borderRadius: 'var(--radius)',
            fontWeight: 600,
            boxShadow: 'var(--shadow-md)'
          }}>
            + Report Item
          </Link>
        </div>
      )}
      <Navbar />
    </div>
  );
}
