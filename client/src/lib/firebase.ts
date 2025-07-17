import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC8l5vZ6Q2qX4X1fJ8E4n7L9Cv3K2p0o1I", // fallback for development
  authDomain: "fairy-82fe4.firebaseapp.com",
  projectId: "fairy-82fe4",
  storageBucket: "fairy-82fe4.firebasestorage.app",
  messagingSenderId: "683551536759",
  appId: "1:683551536759:web:cf9ddbeb7a4225f9ca3872"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;