import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { ref, set, get, push, update } from 'firebase/database';
import { auth, database } from '../firebase/config';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  // ✅ Google Sign-In
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user profile exists in database, if not create it
      const existingProfile = await getUserProfile(user.uid);
      if (!existingProfile) {
        // Extract name from displayName
        const nameParts = user.displayName ? user.displayName.split(' ') : ['', ''];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const userProfileData = {
          uid: user.uid,
          email: user.email,
          firstName,
          lastName,
          phone: '', // Google doesn't provide phone
          displayName: user.displayName || user.email,
          createdAt: new Date().toISOString(),
          orders: [],
          isAdmin: false,
          provider: 'google'
        };

        await set(ref(database, `users/${user.uid}`), userProfileData);
      }

      return user;
    } catch (error) {
      throw error;
    }
  };

  // ✅ Sign Up
  async function signup(email, password, firstName, lastName, phone) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`
      });

      const userProfileData = {
        uid: user.uid,
        email: user.email,
        firstName,
        lastName,
        phone,
        displayName: `${firstName} ${lastName}`,
        createdAt: new Date().toISOString(),
        orders: [],
        isAdmin: false // Default to false; set to true manually for admin users
      };

      await set(ref(database, `users/${user.uid}`), userProfileData);

      return user;
    } catch (error) {
      throw error;
    }
  }

  // ✅ Login
  async function login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  }

  // ✅ Logout
  function logout() {
    return signOut(auth);
  }

  // ✅ Get Profile
  async function getUserProfile(uid) {
    try {
      const snapshot = await get(ref(database, `users/${uid}`));
      if (snapshot.exists()) {
        return snapshot.val();
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  // ✅ Update Profile
  async function updateUserProfile(uid, updates) {
    try {
      await update(ref(database, `users/${uid}`), updates);
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  }

  // ✅ Populate Missing User Profiles (for existing Google users)
  async function populateUserProfiles() {
    try {
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);

      if (snapshot.exists()) {
        const users = snapshot.val();
        const updates = {};

        for (const [uid, userData] of Object.entries(users)) {
          // Check if user has profile data
          if (!userData.email || !userData.displayName) {
            // Try to get user info from Firebase Auth
            try {
              // Note: This requires admin SDK in production
              // For now, we'll create basic profile from available data
              const basicProfile = {
                uid,
                email: userData.email || '',
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                phone: userData.phone || '',
                displayName: userData.displayName || userData.email || `User ${uid.substring(0, 8)}`,
                createdAt: userData.createdAt || new Date().toISOString(),
                orders: userData.orders || [],
                isAdmin: userData.isAdmin || false,
                provider: userData.provider || 'unknown'
              };

              // Only update if we have meaningful data to add
              if (!userData.displayName || !userData.email) {
                updates[`users/${uid}`] = { ...userData, ...basicProfile };
              }
            } catch (authError) {
              console.log(`Could not get auth data for ${uid}:`, authError);
            }
          }
        }

        // Apply all updates
        if (Object.keys(updates).length > 0) {
          await update(ref(database), updates);
          console.log(`Updated ${Object.keys(updates).length} user profiles`);
          return Object.keys(updates).length;
        }
      }

      return 0;
    } catch (error) {
      console.error('Error populating user profiles:', error);
      return 0;
    }
  }

  // ✅ Add Order
  async function addOrder(uid, orderData) {
    try {
      // Remove undefined to satisfy RTDB validation
      const payload = JSON.parse(JSON.stringify({
        ...orderData,
        orderDate: new Date().toISOString(),
        status: orderData?.status || 'pending'
      }));
      const orderRef = await push(ref(database, `users/${uid}/orders`), payload);
      console.log('[AuthContext] Order added', { uid, key: orderRef.key, payload });
      return orderRef.key;
    } catch (error) {
      console.error('Error adding order:', error);
      return null;
    }
  }

  // ✅ Update Order
  async function updateOrder(uid, orderKey, updates) {
    try {
      await update(ref(database, `users/${uid}/orders/${orderKey}`), updates);
      return true;
    } catch (error) {
      console.error('Error updating order:', error);
      return false;
    }
  }

  // ✅ Get Orders
  async function getUserOrders(uid) {
    try {
      const snapshot = await get(ref(database, `users/${uid}/orders`));
      if (snapshot.exists()) {
        const orders = [];
        snapshot.forEach((childSnapshot) => {
          orders.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        return orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
      }
      return [];
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }
  }

  // ✅ Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Helper: is current user admin?
  const isAdmin = userProfile && userProfile.isAdmin === true;

  const value = {
    currentUser,
    userProfile,
    isAdmin,
    signup,
    login,
    logout,
    getUserProfile,
    updateUserProfile,
    populateUserProfiles,
    addOrder,
    updateOrder,
    getUserOrders,
    signInWithGoogle // ✅ Google Login exposed here
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
