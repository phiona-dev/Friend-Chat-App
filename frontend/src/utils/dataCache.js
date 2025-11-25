// Simple in-memory + sessionStorage cache for SPA navigation
const memoryCache = new Map();
const PREFIX = 'appCache:';

function makeKey(key) {
  return PREFIX + key;
}

export function setCache(key, value, { persist = true } = {}) {
  try {
    memoryCache.set(key, value);
    if (persist && typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem(makeKey(key), JSON.stringify(value));
    }
  } catch (e) {
    // ignore
  }
}

export function getCache(key) {
  if (memoryCache.has(key)) return memoryCache.get(key);
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const raw = sessionStorage.getItem(makeKey(key));
      if (raw) {
        const parsed = JSON.parse(raw);
        memoryCache.set(key, parsed);
        return parsed;
      }
    }
  } catch (e) {
    // ignore
  }
  return null;
}

export function hasCache(key) {
  if (memoryCache.has(key)) return true;
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return sessionStorage.getItem(makeKey(key)) !== null;
    }
  } catch (e) {}
  return false;
}

export function removeCache(key) {
  memoryCache.delete(key);
  try { if (typeof window !== 'undefined' && window.sessionStorage) sessionStorage.removeItem(makeKey(key)); } catch(e) {}
}

export function clearCache() {
  memoryCache.clear();
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      Object.keys(sessionStorage).forEach(k => {
        if (k && k.indexOf(PREFIX) === 0) sessionStorage.removeItem(k);
      });
    }
  } catch (e) {}
}

export default { setCache, getCache, hasCache, removeCache, clearCache };
