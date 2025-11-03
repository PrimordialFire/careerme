// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAwA9kFt69A5W4mvm4RIRI8xzXotP5SGig",
  authDomain: "career-guide-73a47.firebaseapp.com",
  projectId: "career-guide-73a47",
  storageBucket: "career-guide-73a47.firebasestorage.app",
  messagingSenderId: "257151820335",
  appId: "1:257151820335:web:ac885ca9d9630bba895cda",
  measurementId: "G-PMM0CGRX19"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;