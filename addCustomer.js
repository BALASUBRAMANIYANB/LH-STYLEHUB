// Script to add a customer user to Firebase
// Run this in your browser console or as a separate script

import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCekoXLCybKxishuRUQ-U3lo2a1FFYPW7k",
  authDomain: "cafe-billing-96901.firebaseapp.com",
  projectId: "cafe-billing-96901",
  storageBucket: "cafe-billing-96901.firebasestorage.app",
  messagingSenderId: "779597144222",
  appId: "1:779597144222:web:0524b254dea2759c709b8f",
  measurementId: "G-W93HVQ63SH",
  databaseURL: "https://lhstylehub-2c188-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

async function createCustomerUser() {
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      'customer@gmail.com', 
      'Customer@123'
    );
    
    const user = userCredential.user;
    
    // Update profile
    await updateProfile(user, {
      displayName: 'John Customer'
    });
    
    // Create user profile in database
    const userProfileData = {
      uid: user.uid,
      email: user.email,
      firstName: 'John',
      lastName: 'Customer',
      phone: '1234567890',
      displayName: 'John Customer',
      createdAt: new Date().toISOString(),
      orders: []
    };
    
    await set(ref(database, `users/${user.uid}`), userProfileData);
    
    console.log('Customer user created successfully!');
    console.log('Email: customer@gmail.com');
    console.log('Password: Customer@123');
    
  } catch (error) {
    console.error('Error creating customer user:', error);
  }
}

// Run the function
createCustomerUser();
