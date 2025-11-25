// Central runtime/build-time configuration for the frontend
const API_BASE = process.env.REACT_APP_API_BASE || '/api';

// Image base / backend origin. If API_BASE is a full URL (set during build), use its origin.
// If API_BASE is a relative path like '/api', fall back to the current origin.
let IMAGE_BASE = '';
try {
  const parsed = new URL(API_BASE, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  IMAGE_BASE = parsed.origin;
} catch (err) {
  IMAGE_BASE = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
}

// Socket origin derived from API_BASE (useful if sockets run on same host as API)
const SOCKET_ORIGIN = IMAGE_BASE;

export { API_BASE, IMAGE_BASE, SOCKET_ORIGIN };
