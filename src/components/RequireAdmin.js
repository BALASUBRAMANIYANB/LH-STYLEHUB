
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

// Change this to your admin email
const ADMIN_EMAIL = 'Lhstylehub@gmail.com';

export default function RequireAdmin({ children }) {
  const { currentUser } = useAuth();

  // Strict email-based admin check
  const isAdmin = !!(
    currentUser &&
    currentUser.email &&
    currentUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  );

  if (!isAdmin) {
    return (
      <div style={{ textAlign: 'center', margin: '4rem auto', maxWidth: 500, padding: '2rem', background: '#fff3f3', borderRadius: 12 }}>
        <h2>Access Denied</h2>
        <p>This page is only accessible to admin users.</p>
      </div>
    );
  }
  return children;
}