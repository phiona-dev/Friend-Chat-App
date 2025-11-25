import React from 'react';
import './Skeleton.css';

export default function Skeleton({ width = '100%', height = 12, circle = false, style = {}, rows = 1, gap = 8 }) {
  const items = [];
  for (let i = 0; i < rows; i++) items.push(i);
  return (
    <div className="skeleton-root" style={{ ...style }}>
      {items.map(i => (
        <div
          key={i}
          className={`skeleton ${circle ? 'skeleton-circle' : ''}`}
          style={{ width: typeof width === 'number' ? `${width}px` : width, height: typeof height === 'number' ? `${height}px` : height, marginBottom: i === items.length - 1 ? 0 : gap }}
        />
      ))}
    </div>
  );
}
