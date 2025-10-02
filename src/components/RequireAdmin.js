
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

// Admin email for seller dashboard access
const ADMIN_EMAIL = 'lhstylehub@gmail.com'; // Updated for production

export default function RequireAdmin({ children }) {
  const { currentUser } = useAuth();

  // Strict email-based admin check
  const isAdmin = !!(
    currentUser &&
    currentUser.email &&
    currentUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  );

  if (!currentUser) {
    return (
      <div style={{ textAlign: 'center', margin: '4rem auto', maxWidth: 500, padding: '2rem', background: '#fff3cd', borderRadius: 12 }}>
        <h2>Login Required</h2>
        <p>Please log in to access the seller dashboard.</p>
        <p>Admin Email: {ADMIN_EMAIL}</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ textAlign: 'center', margin: '4rem auto', maxWidth: 500, padding: '2rem', background: '#fff3f3', borderRadius: 12 }}>
        <h2>Access Denied</h2>
        <p>This page is only accessible to admin users.</p>
        <p>Your email: {currentUser.email}</p>
        <p>Admin email: {ADMIN_EMAIL}</p>
      </div>
    );
  }
  return children;
}