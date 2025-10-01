
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

// Change this to your admin UID
const ADMIN_UID = 'YOUR_ADMIN_UID_HERE';

export default function RequireAdmin({ children }) {
  const { currentUser, userProfile } = useAuth();

  // UID-based admin check
  const isAdmin = currentUser && (currentUser.uid === ADMIN_UID);

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