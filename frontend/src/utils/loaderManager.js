let listeners = new Set();
let activeCount = 0;
// Track individual starts so we can clear timeouts when finished
let pendingStarts = [];
let nextId = 1;

export function subscribeLoader(listener) {
  listeners.add(listener);
  // Immediately inform new listener of current state
  listener(activeCount > 0);
  return () => listeners.delete(listener);
}

function notify() {
  const isLoading = activeCount > 0;
  listeners.forEach((l) => l(isLoading));
}

// startLoader returns a token id for the start; callers may ignore the return value
export function startLoader() {
  const id = nextId++;
  activeCount += 1;

  // safety timeout: auto-finish this particular start after 20s
  const timeout = setTimeout(() => {
    // auto-clean this id if still pending
    const idx = pendingStarts.findIndex(p => p.id === id);
    if (idx !== -1) {
      pendingStarts.splice(idx, 1);
      if (activeCount > 0) activeCount -= 1;
      notify();
      console.warn(`loaderManager: auto-finished loader id=${id} after timeout`);
    }
  }, 20000);

  pendingStarts.push({ id, timeout });
  notify();
  return id;
}

// Optionally pass the id returned from startLoader; if not provided, we'll clear the most recent pending start
export function finishLoader(id) {
  if (id) {
    const idx = pendingStarts.findIndex(p => p.id === id);
    if (idx !== -1) {
      clearTimeout(pendingStarts[idx].timeout);
      pendingStarts.splice(idx, 1);
      if (activeCount > 0) activeCount -= 1;
    } else {
      // id not found: ignore but ensure count is sane
      if (activeCount > 0) activeCount -= 1;
    }
  } else {
    // No id provided: pop the last start (LIFO) and clear its timeout
    const item = pendingStarts.pop();
    if (item) {
      clearTimeout(item.timeout);
      if (activeCount > 0) activeCount -= 1;
    } else {
      activeCount = Math.max(0, activeCount - 1);
    }
  }
  // guard
  if (activeCount < 0) activeCount = 0;
  notify();
}

export function forceFinishAll() {
  // Clear timers and reset state
  pendingStarts.forEach(p => clearTimeout(p.timeout));
  pendingStarts = [];
  activeCount = 0;
  notify();
}

export function wrapPromise(promise) {
  const id = startLoader();
  return promise.finally(() => finishLoader(id));
}
