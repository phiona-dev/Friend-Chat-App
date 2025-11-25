import React from 'react';
import './TopLoadingBar.css';

export default function TopLoadingBar({ loading }) {
  const [progress, setProgress] = React.useState(0);
  const [waiting, setWaiting] = React.useState(false);

  React.useEffect(() => {
    if (!loading) {
      // Complete and fade out
      setWaiting(false);
      setProgress(100);
      const timeout = setTimeout(() => setProgress(0), 300);
      return () => clearTimeout(timeout);
    }

    // When loading starts, simulate YouTube-style progress
    let current = 0;
    setProgress(0);
    setWaiting(false);
    const step = () => {
      // Fast jump at the beginning
      if (current < 60) {
        current += 20;
      } else if (current < 85) {
        current += 5;
      } else if (current < 97) {
        current += 1;
      }
      setProgress(current);

      // When we reach near-complete, mark waiting state
      if (current >= 97) setWaiting(true);

      if (current < 97) {
        timer = setTimeout(step, 250);
      }
    };

    let timer = setTimeout(step, 80);
    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <div className="top-loading-bar-container">
      <div
        className={`top-loading-bar ${loading ? 'is-loading' : ''} ${waiting ? 'waiting' : ''}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
