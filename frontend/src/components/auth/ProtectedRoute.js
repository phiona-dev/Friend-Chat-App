import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const userId = localStorage.getItem('currentUserId');
  
  if (!userId) {
    return <Navigate to="/welcome" replace />;
  }
  
  return children;
}
